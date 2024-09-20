import { useUserStore } from 'context/User/useUserContextStore';
import { ShardClient, ShardSelector } from 'data-plane-gateway';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useMemo } from 'react';
import { logRocketConsole } from 'services/shared';
import useSWR from 'swr';
import { authorizeTask, dataPlaneFetcher_list } from 'utils/dataPlane-utils';

// These status do not change often so checking every 30 seconds is probably enough
const INTERVAL = 30000;

const useShardsList = (catalogNames: string[]) => {
    const session = useUserStore((state) => state.session);

    const fetcher = async (_url: string) => {
        // We check this in the swrKey memo so this should never actually happen
        if (!session) {
            return { shards: [] };
        }

        const shardPromises = catalogNames.map(async (name) => {
            const { reactorAddress, reactorToken } = await authorizeTask(
                session.access_token,
                name
            );
            const reactorURL = new URL(reactorAddress);

            // Pass the shard client to the respective function directly.
            const shardClient = new ShardClient(reactorURL, reactorToken);
            const taskSelector = new ShardSelector().task(name);

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
                    dataPlaneListResponse.length > 0
                        ? dataPlaneListResponse
                        : [],
            };
        });

        const shardResponses = await Promise.all(shardPromises);

        const response: { shards: Shard[] } = { shards: [] };

        shardResponses.forEach(({ shards }) => {
            response.shards = response.shards.concat(shards);
        });

        return response;
    };

    const swrKey = useMemo(
        () =>
            session && catalogNames.length > 0
                ? `shards-${catalogNames.join('-')}`
                : null,
        [session, catalogNames]
    );

    return useSWR(swrKey, fetcher, {
        errorRetryCount: 3,
        errorRetryInterval: INTERVAL / 2,
        refreshInterval: INTERVAL,
        revalidateOnFocus: false, // We're already refreshing and these status do not change often
        onError: async (error: string | Error) => {
            logRocketConsole('useShardsList on error', { error });
        },
    });
};

export default useShardsList;
