/* eslint-disable no-await-in-loop */
import type { ProtocolReadResponse } from 'data-plane-gateway/types/gen/broker/protocol/broker';
import type {
    AttemptToReadResponse,
    JournalByteRange,
    JournalRecord,
    LoadDocumentsProps,
    LoadDocumentsResponse,
} from 'src/hooks/journals/types';

import { parseJournalDocuments } from 'data-plane-gateway';

import { logRocketConsole, logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { INCREMENT } from 'src/utils/dataPlane-utils';
import { journalStatusIsError } from 'src/utils/misc-utils';

function isJournalRecord(val: any): val is JournalRecord {
    return val?._meta?.uuid;
}

export async function* streamAsyncIterator<T>(stream: ReadableStream<T>) {
    // Get a lock on the stream
    const reader = stream.getReader();

    try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
            // Read from the stream
            const { done, value } = await reader.read();

            // Exit if we're done
            if (done) return;

            // Else yield the chunk
            yield value;
        }
    } finally {
        reader.releaseLock();
    }
}

export async function readAllDocuments<T>(stream: ReadableStream<T>) {
    const accum: T[] = [];

    for await (const item of streamAsyncIterator(stream)) {
        accum.push(item);
    }

    return accum;
}

export async function loadDocuments({
    journalName,
    client,
    documentCount,
    maxBytes,
    offsets,
}: LoadDocumentsProps): Promise<LoadDocumentsResponse> {
    if (!client || !journalName || journalName.length === 0) {
        console.warn('Cannot load documents without client and journal');
        return {
            documents: [],
            tooFewDocuments: false,
            tooManyBytes: false,
        };
    }

    const clientResponse = await client.read({
        metadataOnly: true,
        journal: journalName,
    });

    if (clientResponse.err()) {
        const clientError = clientResponse.unwrap_err();

        if (!Boolean(clientError.body.message)) {
            logRocketEvent(CustomEvents.JOURNAL_DATA, {
                missingErrorStatus: 'clientError',
            });
        }

        throw new Error(clientError.body.message);
    }

    const metaInfo = clientResponse.unwrap();

    const generator = streamAsyncIterator<ProtocolReadResponse>(metaInfo);
    const metadataResponse = (await generator.next()).value;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!metadataResponse?.writeHead) {
        throw new Error('Unable to load metadata');
    }

    // Log so we can keep track of statuses we should add custom messages for
    logRocketConsole(CustomEvents.JOURNAL_DATA_STATUS, {
        val: metadataResponse.status,
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (journalStatusIsError(metadataResponse?.status)) {
        if (!Boolean(metadataResponse.status)) {
            logRocketEvent(CustomEvents.JOURNAL_DATA, {
                missingErrorStatus: 'metadataResponse',
            });
        }
        // TODO SWITCH BACK BEFORE MERGE
        throw new Error('OFFSET_NOT_YET_AVAILABLE');
        // throw new Error(metadataResponse.status);
        // TODO SWITCH BACK BEFORE MERGE
    }

    const head = parseInt(metadataResponse.writeHead, 10);
    const providedStart = offsets?.offset && offsets.offset > 0;

    const end =
        offsets?.endOffset && offsets.endOffset > 0 ? offsets.endOffset : head;
    let start = providedStart ? offsets.offset : end;

    // let docsMetaResponse: any; //ProtocolReadResponse
    let range: JournalByteRange = [-1, -1];
    let documents: JournalRecord[] = [];
    let attempt = 0;

    // TODO (gross)
    // This is bad and I feel bad. The function uses references to vars up above.
    //   It was done so we could quickly add the ability to read based only on data size.
    // Future work is needed to full break this hook up into the stand alone pieces that are needed.
    //  More than likely we can have a hook for "readingByDoc" and one for "readingByByte" and have those
    //  share common functions
    const attemptToRead = async (
        readStart: number,
        readEnd: number
    ): Promise<AttemptToReadResponse> => {
        const stream = (
            await client.read({
                journal: journalName,
                offset: `${readStart}`,
                endOffset: `${readEnd}`,
            })
        ).unwrap();

        // Read all the documents
        const allDocs = await readAllDocuments(parseJournalDocuments(stream));

        // TODO: Instead of inefficiently re-reading until we get the desired row count,
        // we should accumulate documents and shift `head` backwards using `ProtocolReadResponse.offset`
        return {
            range: [readStart, readEnd],
            allDocs: allDocs
                .filter(isJournalRecord)
                .filter(
                    (record) =>
                        !(record._meta as unknown as { ack: boolean }).ack
                ),
        };
    };

    const getDocumentMinCount = async (
        minDocCount: number,
        returnAllDocs?: boolean
    ) => {
        while (
            documents.length < minDocCount &&
            start > 0 &&
            head - start <= maxBytes
        ) {
            attempt += 1;
            start = Math.max(0, start - INCREMENT * attempt);
            const readResponse = await attemptToRead(start, end);
            range = readResponse.range;
            documents = returnAllDocs
                ? readResponse.allDocs
                : readResponse.allDocs.slice(minDocCount * -1);
        }
    };

    if (!documentCount) {
        // If we have provided a start we do not want to mess with it. Otherwise, we might
        //  end up fetching data that was already previously fetched.
        start = providedStart ? start : Math.max(0, start - maxBytes);

        // Make sure we are actually trying to load data. If the start and end are the same
        //  that usually means we are loading newer documents but there is nothing newer to load
        if (start !== end) {
            const readResponse = await attemptToRead(start, end);
            range = readResponse.range;
            documents = readResponse.allDocs;

            if (documents.length === 0) {
                logRocketConsole(
                    CustomEvents.JOURNAL_DATA_MAX_BYTES_NOT_ENOUGH
                );
                // If we didn't get anything go ahead and try to keep reading more data until we get something back
                await getDocumentMinCount(1, true);
            }
        }
    } else {
        await getDocumentMinCount(documentCount, false);
    }

    return {
        documents,
        meta: {
            // We passed the entire meta back but replaced with the simpler
            //  ranges. Might need to add this back later for smarter parsing.
            // metadataResponse,
            // docsMetaResponse,
            range,
        },
        tooFewDocuments: documentCount ? start <= 0 : false,
        tooManyBytes: head - start >= maxBytes,
    };
}
