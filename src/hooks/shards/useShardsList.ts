import { useUserStore } from 'context/User/useUserContextStore';
import { ShardClient, ShardSelector } from 'data-plane-gateway';
import useGatewayAuthToken from 'hooks/useGatewayAuthToken';
import { useMemo } from 'react';
import { logRocketConsole } from 'services/shared';
import useSWR from 'swr';
import {
    dataPlaneFetcher_list,
    shouldRefreshToken,
} from 'utils/dataPlane-utils';

// These status do not change often so checking every 30 seconds is probably enough
const INTERVAL = 30000;

const useShardsList = (catalogNames: string[]) => {
    const session = useUserStore((state) => state.session);

    const { data: gatewayConfig, refresh: refreshAccess } =
        useGatewayAuthToken(catalogNames);

    const shardClient = useMemo(() => {
        if (gatewayConfig?.gateway_url && gatewayConfig.token) {
            const authToken = gatewayConfig.token;
            const baseUrl = new URL(gatewayConfig.gateway_url);

            return new ShardClient(baseUrl, authToken);
        } else {
            return null;
        }
    }, [gatewayConfig]);

    const taskSelector = new ShardSelector();
    catalogNames.forEach((name) => taskSelector.task(name));

    const fetcher = async (_url: string) => {
        // We check this in the swrKey memo so this should never actually happen
        if (!(shardClient && session)) {
            return { shards: [] };
        }

        const dataPlaneListResponse = await dataPlaneFetcher_list(
            shardClient,
            taskSelector,
            'ShardsList'
        );

        if (!Array.isArray(dataPlaneListResponse)) {
            return Promise.reject(dataPlaneListResponse);
        }

        return {
            shards:
                dataPlaneListResponse.length > 0 ? dataPlaneListResponse : [],
        };
    };

    const swrKey = useMemo(
        () =>
            shardClient && session && catalogNames.length > 0
                ? `shards-${
                      gatewayConfig?.gateway_url ?? '__missing_gateway_url__'
                  }-${catalogNames.join('-')}`
                : null,
        [shardClient, session, catalogNames, gatewayConfig?.gateway_url]
    );

    return useSWR(swrKey, fetcher, {
        errorRetryCount: 3,
        errorRetryInterval: INTERVAL / 2,
        refreshInterval: INTERVAL,
        revalidateOnFocus: false, // We're already refreshing and these status do not change often
        onError: async (error: string | Error) => {
            logRocketConsole('useShardsList on error', { error });

            // Check if we need to refresh the access token before returning the error
            if (
                shouldRefreshToken(
                    typeof error === 'object' ? error.message : error
                )
            ) {
                await refreshAccess();
            }
        },
    });
};

export default useShardsList;
