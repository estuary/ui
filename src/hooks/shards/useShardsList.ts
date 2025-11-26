import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { TaskAuthorizationResponse } from 'src/utils/dataPlane-utils';

import { useMemo, useRef } from 'react';

import useSWR from 'swr';

import { useUserStore } from 'src/context/User/useUserContextStore';
import useTaskAuthorization from 'src/hooks/gatewayAuth/useTaskAuthorization';
import { logRocketEvent } from 'src/services/shared';
import { fetchShardList } from 'src/utils/dataPlane-utils';
import { isPromiseFulfilledResult } from 'src/utils/misc-utils';

type FetchResponse = { shards: Shard[]; allCallsFailed?: boolean };
type CacheKey = [string, TaskAuthorizationResponse[]];

// These status do not change often so checking every 30 seconds is probably enough
const INTERVAL = 30000;
const MAX_FAILURES = 3;

const useShardsList = (catalogNames: string[]) => {
    const session = useUserStore((state) => state.session);
    const { data: taskAuthorizationData } = useTaskAuthorization(catalogNames);

    // Track failure counts per catalog so we don't spam too much
    const failureCountsRef = useRef<Record<string, number>>({});

    const fetcher = async ([_url, taskAuthorizations]: CacheKey) => {
        const response: FetchResponse = { shards: [] };

        // We check this in the swrKey memo so this should never actually happen
        if (!session) {
            return response;
        }

        const catalogsToFetch = catalogNames.filter(
            (name) => (failureCountsRef.current[name] ?? 0) < MAX_FAILURES
        );

        // This should land here the first time everything failed
        //  next time it should get handled up above the filter.
        if (catalogsToFetch.length === 0) {
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

            return fetchShardList(name, session, reactorAuthorization);
        });

        // We have fetched so assume they all failed until proven otherwise
        let allCallsFailed = true;
        const shardResponses = await Promise.allSettled(shardPromises);
        shardResponses.forEach((shardResponse, index) => {
            const catalogName = catalogsToFetch[index];

            if (
                isPromiseFulfilledResult(shardResponse) &&
                shardResponse.value.shards.length > 0
            ) {
                allCallsFailed = false;
                failureCountsRef.current[catalogName] &&= 0;
                response.shards = response.shards.concat(
                    shardResponse.value.shards
                );
            } else {
                failureCountsRef.current[catalogName] =
                    (failureCountsRef.current[catalogName] ?? 0) + 1;

                logRocketEvent('ShardsList', {
                    catalogName,
                    failureCount: failureCountsRef.current[catalogName],
                });
            }
        });

        // If EVERYTHING failed when a single catalog was fetched
        //  then go ahead and return an error. This is mainly for details
        //  page displaying the shard status of a specific catalog so we
        //  can show a special status
        if (allCallsFailed) {
            logRocketEvent('ShardsList', {
                allFailed: true,
            });
        }

        return {
            ...response,
            allCallsFailed,
        };
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
