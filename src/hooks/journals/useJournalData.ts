import { singleCallSettings } from 'context/SWR';
import { useUserStore } from 'context/User/useUserContextStore';
import { JournalClient, JournalSelector } from 'data-plane-gateway';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCounter } from 'react-use';
import useJournalStore from 'stores/JournalData/Store';
import useSWR from 'swr';
import {
    getJournals,
    MAX_DOCUMENT_SIZE,
    shouldRefreshToken,
} from 'utils/dataPlane-utils';
import { hasLength } from 'utils/misc-utils';
import { loadDocuments } from './shared';
import { LoadDocumentsOffsets } from './types';

const errorRetryCount = 2;

const useJournalsForCollection = (collectionName: string | undefined) => {
    const session = useUserStore((state) => state.session);

    const [attempts, { inc: incAttempts, reset: resetAttempts }] =
        useCounter(0);

    const refreshAuthToken = useJournalStore((state) => state.getAuthToken);
    const brokerAddress = useJournalStore(
        (state) => state.collectionBrokerAddress
    );
    const brokerToken = useJournalStore((state) => state.collectionBrokerToken);

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

                if (isEmpty(dataPlaneListResponse)) {
                    return Promise.reject(dataPlaneListResponse);
                }

                return {
                    journals:
                        dataPlaneListResponse.result.journals &&
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
                  hasLength(brokerAddress)
                      ? brokerAddress
                      : '__missing_broker_address__'
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

                if (
                    session &&
                    shouldRefreshToken(`${error}`) &&
                    collectionName
                ) {
                    await refreshAuthToken(
                        session.access_token,
                        collectionName,
                        true
                    );
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
    settings?: UseJournalDataSettings,
    opsJournalTarget?: boolean
) => {
    const failures = useRef(0);
    const initialLoadComplete = useRef(false);

    const brokerAddress = useJournalStore((state) =>
        opsJournalTarget
            ? state.taskBrokerAddress
            : state.collectionBrokerAddress
    );

    const brokerToken = useJournalStore((state) =>
        opsJournalTarget ? state.taskBrokerToken : state.collectionBrokerToken
    );

    const journalClient = useMemo(() => {
        if (brokerAddress && brokerToken) {
            const baseUrl = new URL(brokerAddress);

            return new JournalClient(baseUrl, brokerToken);
        } else {
            return undefined;
        }
    }, [brokerAddress, brokerToken]);

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
