import type { Shard } from 'data-plane-gateway/types/shard_client';
import type { TaskAuthorizationResponse } from 'src/utils/dataPlane-utils';

import { useMemo, useRef } from 'react';

import useSWR from 'swr';

import { useUserStore } from 'src/context/User/useUserContextStore';
import useTaskAuthorization from 'src/hooks/gatewayAuth/useTaskAuthorization';
import { ALL_FAILED_ERROR_CODE } from 'src/hooks/shards/shared';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { fetchShardList } from 'src/utils/dataPlane-utils';
import { isPromiseFulfilledResult } from 'src/utils/misc-utils';

type FetchResponse = { shards: Shard[] };
type CacheKey = [string, TaskAuthorizationResponse[]];

// These status do not change often so checking every 30 seconds is probably enough
const INTERVAL = 30000;
const MAX_FAILURES = 3;

const useShardsList = (catalogNames: string[]) => {
    const everythingFailed = useRef(false);
    const session = useUserStore((state) => state.session);
    const { data: taskAuthorizationData } = useTaskAuthorization(catalogNames);

    // Track failure counts per catalog so we don't spam too much
    const failureCountsRef = useRef<Record<string, number>>({});

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

            return fetchShardList(name, session, reactorAuthorization);
        });

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
        if (allCallsFailed && catalogNames.length === 1) {
            logRocketEvent('ShardsList', {
                allFailed: true,
            });

            return Promise.reject({
                ...BASE_ERROR,
                code: ALL_FAILED_ERROR_CODE,
            });
        }

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
