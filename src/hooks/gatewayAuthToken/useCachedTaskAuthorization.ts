import { useUserStore } from 'context/User/useUserContextStore';
import { isBefore } from 'date-fns';
import { decodeJwt, JWTPayload } from 'jose';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useEntitiesStore_capabilities_readable } from 'stores/Entities/hooks';
import useSWR, { useSWRConfig } from 'swr';
import {
    authorizeTask,
    TaskAuthorizationResponse,
} from 'utils/dataPlane-utils';
import { getStoredGatewayAuthConfig, storeGatewayAuthConfig } from './cache';

interface TaskAuthorizationFetcherResponse extends TaskAuthorizationResponse {
    cached?: boolean;
    cacheKey?: string;
}

const getCachedConfig = (
    cacheKey: string
): TaskAuthorizationResponse | undefined => {
    try {
        return getStoredGatewayAuthConfig(cacheKey);
    } catch {
        return undefined;
    }
};

const evaluateCacheAndJWT = (cacheKey: string) => {
    const gatewayConfig = getCachedConfig(cacheKey);

    // Grab the data-plane token from local storage.
    let jwt: JWTPayload | undefined;
    try {
        jwt = gatewayConfig ? decodeJwt(gatewayConfig.reactorToken) : undefined;
    } catch {
        jwt = undefined;
    }

    // Check if the Gateway token is expired and we need to get a new one
    let tokenExpired = true;
    if (jwt?.exp) {
        tokenExpired = isBefore(jwt.exp * 1000, Date.now());
    }

    return tokenExpired;
};

// The request body for this API is a string corresponding to the name of the entity a user has access to.
type AuthorizationFetcherArgs = [string, string | undefined];
const gatewayFetcher = ({
    0: prefix,
    1: accessToken,
}: AuthorizationFetcherArgs): Promise<TaskAuthorizationFetcherResponse[]> => {
    // The endpoint should stay the same so just using the prefix and the access token as the cache key.
    const cacheKey = `${prefix}__${accessToken}`;

    evaluateCacheAndJWT(cacheKey);

    // Grab the Gateway token from local storage
    // let jwt: JWTPayload | undefined;
    // try {
    //     gatewayConfig = getStoredGatewayAuthConfig(cacheKey);
    //     jwt = gatewayConfig ? decodeJwt(gatewayConfig.reactorToken) : undefined;
    // } catch {
    //     jwt = undefined;
    //     gatewayConfig = undefined;
    // }

    // Check if the Gateway token is expired and we need to get a new one
    // const tokenExpired = true;
    // if (jwt?.exp) {
    //     tokenExpired = isBefore(jwt.exp * 1000, Date.now());
    // }

    // If the token is still good and it contains a URL (mainly checking b/c typescript) then just
    //  used the cached value.
    // if (!tokenExpired && gatewayConfig) {
    //     return Promise.resolve([{ ...gatewayConfig, cached: true }]);
    // }

    return authorizeTask(accessToken, prefix).then((response) => {
        return [
            {
                ...response,
                cacheKey,
            },
        ];
    });
};

const useCachedReactorToken = (prefix: string) => {
    const { onError } = useSWRConfig();
    const session = useUserStore((state) => state.session);

    const grants = useEntitiesStore_capabilities_readable();

    const prefixAuthorized = grants.includes(prefix);

    if (!prefixAuthorized) {
        logRocketEvent(CustomEvents.GATEWAY_TOKEN_INVALID_PREFIX, {
            prefix,
        });
    }

    const { data, mutate } = useSWR(
        prefixAuthorized ? [prefix, session?.access_token] : null,
        gatewayFetcher,
        {
            onSuccess: ([config]) => {
                if (config.cached) {
                    return;
                }
                const { cacheKey, cached, ...taskAuthorizationResponse } =
                    config;
                storeGatewayAuthConfig(cacheKey, taskAuthorizationResponse);
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

    return { data: data?.[0], refresh: () => mutate() };
};

export default useCachedReactorToken;
