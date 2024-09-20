import { singleCallSettings } from 'context/SWR';
import { useUserStore } from 'context/User/useUserContextStore';
import { JournalClient, JournalSelector } from 'data-plane-gateway';
import {
    ProtocolLabelSelector,
    ProtocolListResponse,
} from 'data-plane-gateway/types/gen/broker/protocol/broker';
import useGatewayAuthToken from 'hooks/gatewayAuthToken/useGatewayAuthToken';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCounter } from 'react-use';
import useSWR from 'swr';
import { MAX_DOCUMENT_SIZE, shouldRefreshToken } from 'utils/dataPlane-utils';
import { getCollectionAuthorizationSettings } from 'utils/env-utils';
import { loadDocuments } from './shared';
import { LoadDocumentsOffsets } from './types';

const errorRetryCount = 2;

interface CollectionAuthorizationResponse {
    brokerAddress: string;
    brokerToken: string;
    opsLogsJournal: string;
    opsStatsJournal: string;
    reactorAddress: string;
    reactorToken: string;
    retryMillis: number;
    shardIdPrefix: string;
}

const { collectionAuthorizationEndpoint } =
    getCollectionAuthorizationSettings();

const authorizeCollection = async (
    accessToken: string | undefined,
    catalogName: string
): Promise<CollectionAuthorizationResponse> =>
    fetch(collectionAuthorizationEndpoint, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
            collection: catalogName,
        }),
    }).then((response) => response.json());

const getJournals = async (
    brokerAddress: string,
    brokerToken: string,
    selector: ProtocolLabelSelector
): Promise<{ result: ProtocolListResponse }> =>
    fetch(`${brokerAddress}/v1/journals/list`, {
        headers: {
            'Authorization': `Bearer ${brokerToken}`,
            'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ selector }),
    }).then((response) => response.json());

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
