import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { TaskAuthorizationResponse } from 'src/utils/dataPlane-utils';

import { useMemo, useRef } from 'react';

import useSWR from 'swr';

import { useUserStore } from 'src/context/User/useUserContextStore';
import useTaskAuthorization from 'src/hooks/gatewayAuth/useTaskAuthorization';
import { logRocketEvent } from 'src/services/shared';
import { fetchShardList } from 'src/utils/dataPlane-utils';
import { isPromiseFulfilledResult } from 'src/utils/misc-utils';

type FetchResponse = { shards: Shard[] };
type CacheKey = [string, TaskAuthorizationResponse[]];

// These status do not change often so checking every 30 seconds is probably enough
const INTERVAL = 5000;
const MAX_FAILURES = 3;

const useShardsList = (catalogNames: string[]) => {
    const everythingFailed = useRef(false);
    const session = useUserStore((state) => state.session);
    const { data: taskAuthorizationData } = useTaskAuthorization(catalogNames);

    // Track failure counts per catalog
    const failureCountsRef = useRef<Record<string, number>>({});

    console.log('failureCountsRef.current', failureCountsRef.current);

    const fetcher = async ([_url, taskAuthorizations]: CacheKey) => {
        const response: FetchResponse = { shards: [] };

        if (
            !session || // We check this in the swrKey memo so this should never actually happen
            everythingFailed.current // If everything has failed we can just stop
        ) {
            return response;
        }

        const catalogsToFetch = catalogNames.filter(
            (name) => (failureCountsRef.current[name] ?? 0) < MAX_FAILURES
        );

        // This should land here the first time everything failed
        //  next time it should get handled up above the filter.
        if (catalogsToFetch.length === 0) {
            everythingFailed.current = true;
            logRocketEvent('ShardsList', {
                everythingFailed: true,
            });
            return response;
        }

        const shardPromises = catalogsToFetch.map(async (name) => {
            const reactorAuthorization = taskAuthorizations
                .filter((authorization) =>
                    authorization.shardIdPrefix.includes(name)
                )
                .map((authorization) => ({
                    address: authorization.reactorAddress,
                    token: authorization.reactorToken,
                }))
                .at(0);

            console.log('reactorAuthorization', reactorAuthorization);

            return fetchShardList(name, session, {
                address: reactorAuthorization?.address ?? '',
                token: `fake-token-travis-testing`,
            });
        });

        const shardResponses = await Promise.allSettled(shardPromises);
        shardResponses.forEach((shardResponse, index) => {
            const catalogName = catalogsToFetch[index];

            console.log('shardResponse', shardResponse);

            if (
                isPromiseFulfilledResult(shardResponse) &&
                shardResponse.value.shards.length > 0
            ) {
                failureCountsRef.current[catalogName] &&= 0;
                response.shards = response.shards.concat(
                    shardResponse.value.shards
                );
            } else {
                failureCountsRef.current[catalogName] =
                    (failureCountsRef.current[catalogName] ?? 0) + 1;

                const failureCount = failureCountsRef.current[catalogName];

                logRocketEvent('ShardsList', {
                    catalogName,
                    failureCount: failureCountsRef.current[catalogName],
                    willRetry: failureCount < MAX_FAILURES,
                });
            }
        });

        return response;
    };

    const swrKey = useMemo<CacheKey | null>(
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
            logRocketEvent('ShardsList', {
                error,
            });
        },
    });
};

export default useShardsList;
