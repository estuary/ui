import { useUserStore } from 'context/User/useUserContextStore';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useEntitiesStore_capabilities_readable } from 'stores/Entities/hooks';
import useSWR, { useSWRConfig } from 'swr';
import {
    authorizeTask,
    TaskAuthorizationResponse,
} from 'utils/dataPlane-utils';
import { hasLength } from 'utils/misc-utils';
import {
    getAuthorizationConfig,
    setAuthorizationConfig,
    validateJWTs,
} from './cache';

interface TaskAuthorizationFetcherResponse extends TaskAuthorizationResponse {
    cached?: boolean;
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
                return Promise.resolve({ ...gatewayConfig, cached: true });
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

    if (!hasLength(authorizedPrefixes)) {
        logRocketEvent(CustomEvents.GATEWAY_TOKEN_INVALID_PREFIX, {
            prefixes,
        });
    }

    const { data, mutate } = useSWR(
        hasLength(authorizedPrefixes)
            ? [authorizedPrefixes, session?.access_token]
            : null,
        gatewayFetcher,
        {
            onSuccess: (configs) => {
                if (!hasLength(configs)) {
                    return;
                }

                configs.forEach((config) => {
                    const { cacheKey, cached, ...taskAuthorizationResponse } =
                        config;

                    setAuthorizationConfig(cacheKey, taskAuthorizationResponse);
                });
            },
            onError: (error, key, config) => {
                logRocketEvent(CustomEvents.GATEWAY_TOKEN_FAILED, {
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
