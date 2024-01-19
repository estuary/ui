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
import useSWR from 'swr';
import {
    dataPlaneFetcher_list,
    MAX_DOCUMENT_SIZE,
    shouldRefreshToken,
} from 'utils/dataPlane-utils';

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

// We increment the read window by this many bytes every time we get back
// fewer than the desired number of rows.
const INCREMENT = 1024 * 1024;

async function readAllDocuments<T>(stream: ReadableStream<T>) {
    const accum: T[] = [];

    for await (const item of streamAsyncIterator(stream)) {
        accum.push(item);
    }

    return accum;
}

export interface LoadDocumentsOffsets {
    offset: number;
    endOffset: number;
}

async function loadDocuments({
    journalName,
    client,
    documentCount,
    maxBytes,
    offsets,
}: {
    offsets?: LoadDocumentsOffsets;
    journalName?: string;
    client?: JournalClient;
    documentCount?: number;
    maxBytes: number;
}) {
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

    const head = parseInt(metadataResponse.writeHead, 10);

    const end =
        offsets?.endOffset && offsets.endOffset > 0 ? offsets.endOffset : head;
    let start = offsets?.offset && offsets.offset > 0 ? offsets.offset : end;

    let docsMetaResponse: any; //ProtocolReadResponse
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

        // Splt the stream so we can read it twice
        const teedDocumentsStream = stream.tee();

        // Read our the documents
        const allDocs = await readAllDocuments(
            parseJournalDocuments(teedDocumentsStream[0])
        );

        // Get the metadata from the document reading
        const docsMetaGenerator = streamAsyncIterator(teedDocumentsStream[1]);
        docsMetaResponse = (await docsMetaGenerator.next()).value;

        // TODO: Instead of inefficiently re-reading until we get the desired row count,
        // we should accumulate documents and shift `head` backwards using `ProtocolReadResponse.offset`
        return allDocs
            .filter(isJournalRecord)
            .filter(
                (record) => !(record._meta as unknown as { ack: boolean }).ack
            );
    };

    if (!documentCount) {
        start = Math.max(0, start - maxBytes);
        documents = await attemptToRead();
    } else {
        while (
            documents.length < documentCount &&
            start > 0 &&
            head - start < maxBytes
        ) {
            attempt += 1;
            start = Math.max(0, start - INCREMENT * attempt);
            documents = (await attemptToRead()).slice(documentCount * -1);
        }
    }

    return {
        documents,
        meta: {
            metadataResponse,
            docsMetaResponse,
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

    const [refreshing, setRefreshing] = useState(false);
    const [offsets, setOffsets] = useState<LoadDocumentsOffsets>({
        offset: 0,
        endOffset: 0,
    });

    const [data, setData] =
        useState<Awaited<ReturnType<typeof loadDocuments>>>();
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void (async () => {
            if (
                (refreshing && !loading) ||
                (failures.current < 2 &&
                    journalName &&
                    journalClient &&
                    !loading &&
                    !data)
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
                    // Make sure to set refreshing back first
                    //  Otherwise the effect fires again with loading=false|refreshing=true and loads more data
                    setRefreshing(false);
                    setLoading(false);
                }
            }
        })();
    }, [
        data,
        journalClient,
        journalName,
        loading,
        offsets,
        refreshing,
        settings?.desiredCount,
        settings?.maxBytes,
    ]);

    return useMemo(
        () => ({
            data,
            error,
            loading,
            refresh: (newOffset?: LoadDocumentsOffsets) => {
                failures.current = 0;

                if (newOffset) {
                    setOffsets(newOffset);
                }

                setRefreshing(true);
            },
        }),
        [data, error, loading]
    );
};

export { useJournalData, useJournalsForCollection };
