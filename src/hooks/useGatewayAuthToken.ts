import { Auth } from '@supabase/ui';
import { isBefore } from 'date-fns';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { decodeJwt, JWTPayload } from 'jose';
import { client } from 'services/client';
import useSWR from 'swr';
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
const fetcher = (
    endpoint: string,
    prefixes: string[],
    sessionKey: string | undefined
): Promise<GatewayAuthTokenResponse[]> => {
    const headers: HeadersInit = {};

    const { supabaseAnonymousKey } = getSupabaseAnonymousKey();

    headers.apikey = supabaseAnonymousKey;
    headers.Authorization = `Bearer ${sessionKey}`;
    headers['Content-Type'] = 'application/json';

    return client(endpoint, {
        data: { prefixes },
        headers,
    });
};

const useGatewayAuthToken = () => {
    const { session } = Auth.useUser();

    const { combinedGrants: grants } = useCombinedGrantsExt({});

    const prefixes: string[] = grants.map(({ object_role }) => object_role);

    const gatewayConfig = getStoredGatewayAuthConfig();

    let jwt: JWTPayload | undefined;

    try {
        jwt = gatewayConfig ? decodeJwt(gatewayConfig.token) : undefined;
    } catch {
        jwt = undefined;
    }

    let tokenExpired = true;

    if (jwt?.exp) {
        tokenExpired = isBefore(jwt.exp * 1000, Date.now());
    }

    return useSWR(
        (!gatewayConfig?.token || tokenExpired) && prefixes.length > 0
            ? [gatewayAuthTokenEndpoint, prefixes, session?.access_token]
            : null,
        fetcher,
        {
            onSuccess: ([response]) => {
                storeGatewayAuthConfig(response);
            },
            onError: (error) => {
                // TODO: Remove console.log call.
                console.log(error);
            },
        }
    );
};

export default useGatewayAuthToken;
