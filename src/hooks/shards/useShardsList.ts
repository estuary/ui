import { useUserStore } from 'context/User/useUserContextStore';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { useMemo } from 'react';
import { logRocketConsole } from 'services/shared';
import useSWR from 'swr';
import { fetchShardList } from 'utils/dataPlane-utils';

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
            return fetchShardList(name, session);
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

    // TODO: Terminate the poller when shard-related information for a given task
    //   is no longer needed.
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
