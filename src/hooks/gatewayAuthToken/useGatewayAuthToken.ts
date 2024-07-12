import { useUserStore } from 'context/User/useUserContextStore';
import { isBefore } from 'date-fns';
import { decodeJwt, JWTPayload } from 'jose';
import { isEmpty } from 'lodash';
import { client } from 'services/client';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useEntitiesStore_capabilities_readable } from 'stores/Entities/hooks';
import useSWR, { useSWRConfig } from 'swr';
import { GatewayAuthTokenResponse } from 'types';
import {
    getGatewayAuthTokenSettings,
    getSupabaseAnonymousKey,
} from 'utils/env-utils';
import { getStoredGatewayAuthConfig, storeGatewayAuthConfig } from './cache';

const { gatewayAuthTokenEndpoint } = getGatewayAuthTokenSettings();

interface GatewayAuthTokenFetcherResponse extends GatewayAuthTokenResponse {
    cached?: boolean;
    cacheKey?: string;
}

// The request body for this API is a string array corresponding to the prefixes a user has access to.
type GatewayFetcherArgs = [string, string[], string | undefined];
const gatewayFetcher = ({
    0: endpoint,
    1: prefixes,
    2: sessionKey,
}: GatewayFetcherArgs): Promise<GatewayAuthTokenFetcherResponse[]> => {
    // The endpoint should stay the same so just using the prefixes and the session key as the cache key
    const cacheKey = `${prefixes.join(',')}__${sessionKey}`;

    // Grab the Gateway token from local storage
    let jwt: JWTPayload | undefined,
        gatewayConfig: GatewayAuthTokenResponse | undefined;
    try {
        gatewayConfig = getStoredGatewayAuthConfig(cacheKey);
        jwt = gatewayConfig ? decodeJwt(gatewayConfig.token) : undefined;
    } catch {
        jwt = undefined;
        gatewayConfig = undefined;
    }

    // Check if the Gateway token is expired and we need to get a new one
    let tokenExpired = true;
    if (jwt?.exp) {
        tokenExpired = isBefore(jwt.exp * 1000, Date.now());
    }

    // If the token is still good and it contains a URL (mainly checking b/c typescript) then just
    //  used the cached value.
    if (!tokenExpired && gatewayConfig?.gateway_url) {
        return Promise.resolve([{ ...gatewayConfig, cached: true }]);
    }

    const headers: HeadersInit = {};

    // Use the supabase key because we're calling a Supabase function to fetch
    //   the key we need to make calls to the Gateway
    const { supabaseAnonymousKey } = getSupabaseAnonymousKey();
    headers.apikey = supabaseAnonymousKey;

    return client(
        endpoint,
        {
            data: { prefixes },
            headers,
        },
        sessionKey
    ).then((response: any) => {
        return [
            {
                ...response[0],
                cacheKey,
            },
        ];
    });
};

const useGatewayAuthToken = (prefixes: string[] | null) => {
    const { onError } = useSWRConfig();
    const session = useUserStore((state) => state.session);

    const grants = useEntitiesStore_capabilities_readable();

    const allowed_prefixes: string[] = !isEmpty(grants)
        ? grants.map((grant) => grant)
        : [];

    const authorized_prefixes = prefixes
        ? prefixes.filter((prefix) =>
              allowed_prefixes.find((allowed_prefix) =>
                  prefix.startsWith(allowed_prefix)
              )
          )
        : [];

    const authorizedPrefixCount = authorized_prefixes.length;
    const hasAuthorizedPrefixes = authorizedPrefixCount > 0;

    if (prefixes) {
        if (authorizedPrefixCount !== prefixes.length) {
            logRocketEvent(CustomEvents.GATEWAY_TOKEN_INVALID_PREFIX, {
                prefixes: prefixes.filter(
                    (prefix) => !allowed_prefixes.includes(prefix)
                ),
            });
        }
    }

    const { data, mutate } = useSWR(
        hasAuthorizedPrefixes
            ? [
                  gatewayAuthTokenEndpoint,
                  authorized_prefixes,
                  session?.access_token,
              ]
            : null,
        gatewayFetcher,
        {
            onSuccess: ([config]) => {
                if (config.cached) {
                    return;
                }
                const { cacheKey, ...theRest } = config;
                storeGatewayAuthConfig(cacheKey, theRest);
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

export default useGatewayAuthToken;
