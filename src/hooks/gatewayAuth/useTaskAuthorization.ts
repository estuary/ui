import type { TaskAuthorizationResponse } from 'src/utils/dataPlane-utils';

import useSWR, { useSWRConfig } from 'swr';

import { useUserStore } from 'src/context/User/useUserContextStore';
import {
    getAuthorizationConfig,
    setAuthorizationConfig,
    validateJWTs,
} from 'src/hooks/gatewayAuth/cache';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useEntitiesStore_capabilities_readable } from 'src/stores/Entities/hooks';
import { authorizeTask } from 'src/utils/dataPlane-utils';
import { hasLength } from 'src/utils/misc-utils';

interface TaskAuthorizationFetcherResponse extends TaskAuthorizationResponse {
    cacheKey?: string;
}

// The request body for this API is a string corresponding to the name of the entity a user has access to.
type AuthorizationFetcherArgs = [string[], string | undefined];
const gatewayFetcher = async ({
    0: prefixes,
    1: accessToken,
}: AuthorizationFetcherArgs): Promise<TaskAuthorizationFetcherResponse[]> => {
    const fetcherPromises = prefixes.map(
        async (prefix): Promise<TaskAuthorizationFetcherResponse> => {
            // The endpoint should stay the same so just using the prefix and the access token as the cache key.
            const cacheKey = `${prefix}__task-auth__${accessToken}`;

            const gatewayConfig = getAuthorizationConfig(cacheKey);
            const tokensExpired = validateJWTs(gatewayConfig);

            // If the token is valid and the cached configuration is defined, then return the cached value.
            if (!tokensExpired && gatewayConfig) {
                return Promise.resolve({ ...gatewayConfig, cacheKey });
            }

            const response = await authorizeTask(accessToken, prefix);

            return { ...response, cacheKey };
        }
    );

    return Promise.all(fetcherPromises);
};

const useTaskAuthorization = (prefixes: string[]) => {
    const { onError } = useSWRConfig();
    const session = useUserStore((state) => state.session);

    const grants = useEntitiesStore_capabilities_readable();

    const authorizedPrefixes = prefixes.filter((prefix) =>
        grants.find((grant) => prefix.startsWith(grant))
    );

    if (!hasLength(authorizedPrefixes) && hasLength(prefixes)) {
        logRocketEvent(`${CustomEvents.AUTHORIZE_TASK} : InvalidPrefix`, {
            prefixes,
        });
    }

    const { data, mutate } = useSWR(
        session?.access_token && hasLength(authorizedPrefixes)
            ? [authorizedPrefixes, session.access_token]
            : null,
        gatewayFetcher,
        {
            onSuccess: (configs) => {
                if (!hasLength(configs)) {
                    logRocketEvent(`${CustomEvents.AUTHORIZE_TASK} : Empty`);

                    return;
                }

                configs.forEach((config) => {
                    const { cacheKey, ...taskAuthorizationResponse } = config;

                    setAuthorizationConfig(cacheKey, taskAuthorizationResponse);
                });
            },
            onError: (error, key, config) => {
                logRocketEvent(`${CustomEvents.AUTHORIZE_TASK} : CallFailed`, {
                    error,
                });

                // TODO (typing | SWR)
                // The config complains about the typing so just setting to any
                // Similar to this issue : https://github.com/vercel/swr/discussions/1574#discussioncomment-4982649
                onError(error, key, config as any);
            },
        }
    );

    return { data, refresh: () => mutate() };
};

export default useTaskAuthorization;
