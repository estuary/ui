import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { TaskAuthorizationResponse } from 'src/utils/dataPlane-utils';

import { useMemo } from 'react';

import useSWR from 'swr';

import { useUserStore } from 'src/context/User/useUserContextStore';
import useTaskAuthorization from 'src/hooks/gatewayAuth/useTaskAuthorization';
import { logRocketConsole } from 'src/services/shared';
import { fetchShardList } from 'src/utils/dataPlane-utils';

// These status do not change often so checking every 30 seconds is probably enough
const INTERVAL = 30000;

const useShardsList = (catalogNames: string[]) => {
    const session = useUserStore((state) => state.session);
    const { data: taskAuthorizationData } = useTaskAuthorization(catalogNames);

    const fetcher = async ([_url, taskAuthorizations]: [
        string,
        TaskAuthorizationResponse[],
    ]) => {
        // We check this in the swrKey memo so this should never actually happen
        if (!session) {
            return { shards: [] };
        }

        const shardPromises = catalogNames.map(async (name) => {
            const reactorAuthorization = taskAuthorizations
                .filter((authorization) =>
                    authorization.shardIdPrefix.includes(name)
                )
                .map((authorization) => ({
                    address: authorization.reactorAddress,
                    token: authorization.reactorToken,
                }))
                .at(0);

            return fetchShardList(name, session, reactorAuthorization);
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
            session && taskAuthorizationData?.length && catalogNames.length > 0
                ? [`shards-${catalogNames.join('-')}`, taskAuthorizationData]
                : null,
        [session, catalogNames, taskAuthorizationData]
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
