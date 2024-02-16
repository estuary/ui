/* eslint-disable no-await-in-loop */
import { Auth } from '@supabase/ui';
import { singleCallSettings } from 'context/SWR';
import {
    JournalClient,
    JournalSelector,
    parseJournalDocuments,
} from 'data-plane-gateway';
import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCounter } from 'react-use';
import { logRocketConsole } from 'services/shared';
import { CustomEvents } from 'services/types';
import useSWR from 'swr';
import {
    dataPlaneFetcher_list,
    INCREMENT,
    MAX_DOCUMENT_SIZE,
    shouldRefreshToken,
} from 'utils/dataPlane-utils';
import { journalStatusIsError } from 'utils/misc-utils';
import { JournalByteRange, LoadDocumentsOffsets } from './shared';

const errorRetryCount = 2;

const useJournalsForCollection = (collectionName: string | undefined) => {
    const { session } = Auth.useUser();

    const [attempts, { inc: incAttempts, reset: resetAttempts }] =
        useCounter(0);

    const { data: gatewayConfig, refresh: refreshAuthToken } =
        useGatewayAuthToken(collectionName ? [collectionName] : []);

    const journalClient = useMemo(() => {
        if (gatewayConfig?.gateway_url && gatewayConfig.token) {
            const authToken = gatewayConfig.token;
            const baseUrl = new URL(gatewayConfig.gateway_url);

            return new JournalClient(baseUrl, authToken);
        } else {
            return null;
        }
    }, [gatewayConfig]);

    const fetcher = useCallback(
        async (_url: string) => {
            if (journalClient && collectionName) {
                const journalSelector = new JournalSelector().collection(
                    collectionName
                );

                const dataPlaneListResponse = await dataPlaneFetcher_list(
                    journalClient,
                    journalSelector,
                    'JournalData'
                );

                if (!Array.isArray(dataPlaneListResponse)) {
                    return Promise.reject(dataPlaneListResponse);
                }

                return {
                    journals:
                        dataPlaneListResponse.length > 0
                            ? dataPlaneListResponse
                            : [],
                };
            } else {
                return null;
            }
        },
        [collectionName, journalClient]
    );

    const response = useSWR(
        collectionName
            ? `journals-${collectionName}-${
                  gatewayConfig?.gateway_url ?? '__missing_gateway_url__'
              }`
            : null,
        fetcher,
        {
            // TODO (data preview refresh) no polling right now we should add a manual refresh button
            ...singleCallSettings,
            errorRetryCount,
            refreshInterval: undefined,
            revalidateOnFocus: false,
            onError: async (error) => {
                incAttempts();

                if (session && shouldRefreshToken(`${error}`)) {
                    await refreshAuthToken();
                    resetAttempts();
                }

                return Promise.reject(error);
            },
        }
    );

    return {
        ...response,
        error: attempts > errorRetryCount ? response.error : null,
        mutate: async () => {
            resetAttempts();
            await response.mutate();
        },
    };
};

async function* streamAsyncIterator<T>(stream: ReadableStream<T>) {
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

async function readAllDocuments<T>(stream: ReadableStream<T>) {
    const accum: T[] = [];

    for await (const item of streamAsyncIterator(stream)) {
        accum.push(item);
    }

    return accum;
}

interface LoadDocumentsProps {
    offsets?: LoadDocumentsOffsets;
    journalName?: string;
    client?: JournalClient;
    documentCount?: number;
    maxBytes: number;
}

interface LoadDocumentsResponse {
    documents: any[];
    tooFewDocuments: boolean;
    tooManyBytes: boolean;
    meta?: {
        range: JournalByteRange;
    };
}

async function loadDocuments({
    journalName,
    client,
    documentCount,
    maxBytes,
    offsets,
}: LoadDocumentsProps): Promise<LoadDocumentsResponse> {
    if (!client || !journalName) {
        console.warn('Cannot load documents without client and journal');
        return {
            documents: [],
            tooFewDocuments: false,
            tooManyBytes: false,
        };
    }

    const metaInfo = (
        await client.read({
            metadataOnly: true,
            journal: journalName,
        })
    ).unwrap();

    const generator = streamAsyncIterator(metaInfo);

    const metadataResponse = (await generator.next()).value;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!metadataResponse?.writeHead) {
        throw new Error('Unable to load metadata');
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (journalStatusIsError(metadataResponse?.status)) {
        throw new Error(metadataResponse.status);
    }

    const head = parseInt(metadataResponse.writeHead, 10);
    const providedStart = offsets?.offset && offsets.offset > 0;

    const end =
        offsets?.endOffset && offsets.endOffset > 0 ? offsets.endOffset : head;
    let start = providedStart ? offsets.offset : end;

    // let docsMetaResponse: any; //ProtocolReadResponse
    let documents: JournalRecord[] = [];
    let attempt = 0;

    // TODO (gross)
    // This is bad and I feel bad. The function uses references to vars up above.
    //   It was done so we could quickly add the ability to read based only on data size.
    // Future work is needed to full break this hook up into the stand alone pieces that are needed.
    //  More than likely we can have a hook for "readingByDoc" and one for "readingByByte" and have those
    //  share common functions
    const attemptToRead = async () => {
        const stream = (
            await client.read({
                journal: journalName,
                offset: `${start}`,
                endOffset: `${end}`,
            })
        ).unwrap();

        // Read all the documents
        const allDocs = await readAllDocuments(parseJournalDocuments(stream));

        // TODO: Instead of inefficiently re-reading until we get the desired row count,
        // we should accumulate documents and shift `head` backwards using `ProtocolReadResponse.offset`
        return allDocs
            .filter(isJournalRecord)
            .filter(
                (record) => !(record._meta as unknown as { ack: boolean }).ack
            );
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
            const readDocuments = await attemptToRead();
            documents = returnAllDocs
                ? readDocuments
                : readDocuments.slice(minDocCount * -1);
        }
    };

    if (!documentCount) {
        // If we have provided a start we do not want to mess with it. Otherwise, we might
        //  end up fetching data that was already previously fetched.
        start = providedStart ? start : Math.max(0, start - maxBytes);

        // Make sure we are actually trying to load data. If the start and end are the same
        //  that usually means we are loading newer documents but there is nothing newer to load
        if (start !== end) {
            documents = await attemptToRead();

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
            range: [start, end],
        },
        tooFewDocuments: documentCount ? start <= 0 : false,
        tooManyBytes: head - start >= maxBytes,
    };
}

export type JournalRecord<B extends {} = Record<string, any>> = B & {
    _meta: {
        uuid: string;
    };
};

function isJournalRecord(val: any): val is JournalRecord {
    return val?._meta?.uuid;
}

interface UseJournalDataSettings {
    // If you want a specific amount we'll keep making calls to get that many docs.
    //  Otherwise we just return whatever we got in the call you made.
    desiredCount?: number;
    maxBytes?: number;
}
const useJournalData = (
    journalName?: string,
    collectionName?: string,
    settings?: UseJournalDataSettings
) => {
    const failures = useRef(0);
    const initialLoadComplete = useRef(false);

    const { data: gatewayConfig } = useGatewayAuthToken(
        collectionName ? [collectionName] : null
    );

    const journalClient = useMemo(() => {
        if (journalName && gatewayConfig?.gateway_url && gatewayConfig.token) {
            const authToken = gatewayConfig.token;
            const baseUrl = new URL(gatewayConfig.gateway_url);

            return new JournalClient(baseUrl, authToken);
        } else {
            return undefined;
        }
    }, [gatewayConfig, journalName]);

    const [data, setData] =
        useState<Awaited<ReturnType<typeof loadDocuments>>>();
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const refreshData = useCallback(
        async (offsets?: LoadDocumentsOffsets) => {
            if (
                !loading &&
                failures.current < 2 &&
                journalName &&
                journalClient
            ) {
                try {
                    setLoading(true);
                    const docs = await loadDocuments({
                        journalName,
                        client: journalClient,
                        documentCount: settings?.desiredCount,
                        maxBytes: settings?.maxBytes ?? MAX_DOCUMENT_SIZE,
                        offsets,
                    });
                    setData(docs);
                } catch (e: unknown) {
                    failures.current += 1;
                    setError(e);
                } finally {
                    setLoading(false);
                }
            }
        },
        [
            journalClient,
            journalName,
            loading,
            settings?.desiredCount,
            settings?.maxBytes,
        ]
    );

    // Fire off a call to load data on load
    useEffect(() => {
        void (async () => {
            if (!initialLoadComplete.current && journalName && journalClient) {
                initialLoadComplete.current = true;
                void refreshData();
            }
        })();
    }, [journalClient, journalName, refreshData]);

    return useMemo(
        () => ({
            data,
            error,
            loading,
            refresh: (newOffset?: LoadDocumentsOffsets) => {
                failures.current = 0;
                void refreshData(newOffset);
            },
        }),
        [data, error, loading, refreshData]
    );
};

export { useJournalData, useJournalsForCollection };
