import { Auth } from '@supabase/ui';
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
import {
    getStoredGatewayAuthConfig,
    storeGatewayAuthConfig,
} from 'utils/localStorage-utils';

const { gatewayAuthTokenEndpoint } = getGatewayAuthTokenSettings();

// The request body for this API is a string array corresponding to the prefixes a user has access to.
export const gatewayFetcher = (
    endpoint: string,
    prefixes: string[],
    sessionKey: string | undefined
): Promise<GatewayAuthTokenResponse[]> => {
    const headers: HeadersInit = {};

    // Use the supabase key because we're calling a Supabase function to fetch
    //   the key we need to make calls to the Gateway
    const { supabaseAnonymousKey } = getSupabaseAnonymousKey();
    headers.apikey = supabaseAnonymousKey;

    headers.Authorization = `Bearer ${sessionKey}`;
    headers['Content-Type'] = 'application/json';

    return client(endpoint, {
        data: { prefixes },
        headers,
    });
};

const useGatewayAuthToken = (prefixes: string[] | null) => {
    const { onError } = useSWRConfig();
    const { session } = Auth.useUser();

    const readable = useEntitiesStore_capabilities_readable();
    const grants = Object.keys(readable);

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

    if (prefixes) {
        if (authorized_prefixes.length !== prefixes.length) {
            logRocketEvent(CustomEvents.GATEWAY_TOKEN_INVALID_PREFIX, {
                prefixes: prefixes.filter(
                    (prefix) => !allowed_prefixes.includes(prefix)
                ),
            });
        }
    }

    // Grab the Gateway token from local storage
    let jwt: JWTPayload | undefined;
    try {
        const gatewayConfig = getStoredGatewayAuthConfig();
        jwt = gatewayConfig ? decodeJwt(gatewayConfig.token) : undefined;
    } catch {
        jwt = undefined;
    }

    // Check if the Gateway token is expired and we need to get a new one
    let tokenExpired = true;
    if (jwt?.exp) {
        tokenExpired = isBefore(jwt.exp * 1000, Date.now());
    }

    const { data, mutate } = useSWR(
        (jwt && tokenExpired) || authorized_prefixes.length > 0
            ? [
                  gatewayAuthTokenEndpoint,
                  authorized_prefixes,
                  session?.access_token,
              ]
            : null,
        gatewayFetcher,
        {
            onSuccess: ([config]) => {
                storeGatewayAuthConfig(config);
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
