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
import useSWR from 'swr';

enum ErrorFlags {
    // TOKEN_PARSING_ISSUE = 'parsing jwt:', // useful for testing just add it to the onError
    TOKEN_NOT_FOUND = 'Unauthenticated',
    TOKEN_INVALID = 'Authentication failed',
    OPERATION_INVALID = 'Unauthorized',
}

const useJournalsForCollection = (collectionName: string | undefined) => {
    const { session } = Auth.useUser();

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
        (_url: string) => {
            if (journalClient && collectionName) {
                const journalSelector = new JournalSelector().collection(
                    collectionName
                );
                return journalClient.list(journalSelector).then((result) => {
                    const journals = result.unwrap();

                    return {
                        journals: journals.length > 0 ? journals : [],
                    };
                });
            } else {
                return null;
            }
        },
        [collectionName, journalClient]
    );

    return useSWR(
        collectionName
            ? `journals-${collectionName}-${
                  gatewayConfig?.gateway_url ?? '__missing_gateway_url__'
              }`
            : null,
        fetcher,
        {
            // TODO (data preview refresh) no polling right now we should add a manual refresh button
            ...singleCallSettings,
            errorRetryCount: 2,
            refreshInterval: undefined,
            revalidateOnFocus: false,
            onError: async (error) => {
                const errorAsString = `${error}`;
                if (
                    session &&
                    (errorAsString.includes(ErrorFlags.TOKEN_INVALID) ||
                        errorAsString.includes(ErrorFlags.TOKEN_NOT_FOUND))
                ) {
                    await refreshAuthToken();
                }

                console.error(error);

                return Promise.reject(error);
            },
        }
    );
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

async function loadDocuments({
    journalName,
    client,
    documentCount,
    maxBytes,
}: {
    journalName?: string;
    client?: JournalClient;
    documentCount: number;
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
    let start = head;

    let documents: JournalRecord[] = [];

    let attempt = 0;

    while (
        documents.length < documentCount &&
        start > 0 &&
        head - start < maxBytes
    ) {
        attempt += 1;
        start = Math.max(0, start - INCREMENT * attempt);
        const stream = (
            await client.read({
                journal: journalName,
                offset: `${start}`,
                endOffset: `${head}`,
            })
        ).unwrap();
        const journalDocumentStream = parseJournalDocuments(stream);
        const allDocs = await readAllDocuments(journalDocumentStream);

        // TODO: Instead of inefficiently re-reading until we get the desired row count,
        // we should accumulate documents and shift `head` backwards using `ProtocolReadResponse.offset`
        documents = allDocs
            .filter(isJournalRecord)
            .filter(
                (record) => !(record._meta as unknown as { ack: boolean }).ack
            )
            .slice(documentCount * -1);
    }
    return {
        documents,
        tooFewDocuments: start <= 0,
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

const useJournalData = (
    journalName?: string,
    desiredCount: number = 50,
    collectionName?: string,
    // 16mb, which is the max document size, ensuring we'll always get at least 1 doc if it exists
    maxBytes: number = 16 * 10 ** 6
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

    const [data, setData] =
        useState<Awaited<ReturnType<typeof loadDocuments>>>();
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void (async () => {
            if (
                (failures.current < 2 &&
                    journalName &&
                    journalClient &&
                    !loading &&
                    !data) ||
                refreshing
            ) {
                try {
                    setLoading(true);
                    const docs = await loadDocuments({
                        journalName,
                        client: journalClient,
                        documentCount: desiredCount,
                        maxBytes,
                    });
                    setData(docs);
                } catch (e: unknown) {
                    failures.current += 1;
                    setError(e);
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        })();
    }, [
        desiredCount,
        journalClient,
        journalName,
        maxBytes,
        refreshing,
        loading,
        data,
    ]);

    return {
        data,
        error,
        loading,
        refresh: () => {
            failures.current = 0;
            setRefreshing(true);
        },
    };
};

export { useJournalData, useJournalsForCollection };