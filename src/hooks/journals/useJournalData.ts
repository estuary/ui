import { singleCallSettings } from 'context/SWR';
import { useUserStore } from 'context/User/useUserContextStore';
import { JournalClient, JournalSelector } from 'data-plane-gateway';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCounter } from 'react-use';
import useSWR from 'swr';
import {
    authorizeCollection,
    authorizeTask,
    getJournals,
    MAX_DOCUMENT_SIZE,
    shouldRefreshToken,
} from 'utils/dataPlane-utils';
import { loadDocuments } from './shared';
import { LoadDocumentsOffsets } from './types';

const errorRetryCount = 2;

const useJournalsForCollection = (collectionName: string | undefined) => {
    const session = useUserStore((state) => state.session);

    const [attempts, { inc: incAttempts, reset: resetAttempts }] =
        useCounter(0);

    const [brokerAddress, setBrokerAddress] = useState<string | undefined>(
        undefined
    );
    const [brokerToken, setBrokerToken] = useState<string | undefined>(
        undefined
    );

    useEffect(() => {
        if (session?.access_token && collectionName) {
            authorizeCollection(session.access_token, collectionName).then(
                (response) => {
                    setBrokerAddress(response.brokerAddress);
                    setBrokerToken(response.brokerToken);
                },
                () => {}
            );
        }
    }, [collectionName, session?.access_token, setBrokerAddress]);

    const journalClient = useMemo(() => {
        if (brokerAddress && brokerToken) {
            const baseUrl = new URL(brokerAddress);

            return new JournalClient(baseUrl, brokerToken);
        } else {
            return null;
        }
    }, [brokerAddress, brokerToken]);

    const fetcher = useCallback(
        async (_url: string) => {
            if (
                journalClient &&
                collectionName &&
                brokerAddress &&
                brokerToken
            ) {
                const journalSelector = new JournalSelector().collection(
                    collectionName
                );

                const dataPlaneListResponse = await getJournals(
                    brokerAddress,
                    brokerToken,
                    {
                        include: journalSelector.toLabelSet(),
                    }
                );

                if (!Array.isArray(dataPlaneListResponse.result.journals)) {
                    return Promise.reject(dataPlaneListResponse);
                }

                return {
                    journals:
                        dataPlaneListResponse.result.journals.length > 0
                            ? dataPlaneListResponse.result.journals
                            : [],
                };
            } else {
                return null;
            }
        },
        [brokerAddress, brokerToken, collectionName, journalClient]
    );

    const response = useSWR(
        collectionName && brokerToken
            ? `journals-${collectionName}-${
                  brokerAddress ?? '__missing_broker_address__'
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
                    // await refreshAuthToken();
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

    const session = useUserStore((state) => state.session);

    const [brokerAddress, setBrokerAddress] = useState<string | undefined>(
        undefined
    );
    const [brokerToken, setBrokerToken] = useState<string | undefined>(
        undefined
    );
    const [opsName, setOpsName] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (session?.access_token && collectionName) {
            authorizeTask(session.access_token, collectionName).then(
                (response) => {
                    setBrokerAddress(response.brokerAddress);
                    setBrokerToken(response.brokerToken);
                    setOpsName(response.opsLogsJournal);
                },
                () => {}
            );
        }
    }, [collectionName, session?.access_token, setBrokerAddress, setOpsName]);

    const journalClient = useMemo(() => {
        if (opsName && brokerAddress && brokerToken) {
            const baseUrl = new URL(brokerAddress);

            return new JournalClient(baseUrl, brokerToken);
        } else {
            return undefined;
        }
    }, [brokerAddress, brokerToken, opsName]);

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
                        journalName: opsName,
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
            opsName,
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
