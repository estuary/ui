import { Auth } from '@supabase/ui';
import { getGrantsForAuthToken } from 'api/combinedGrantsExt';
import { isBefore } from 'date-fns';
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
import { useSelectNew } from './supabase-swr/hooks/useSelect';

interface CombinedGrantsExtQuery {
    id: string;
    object_role: string;
}

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

const useGatewayAuthToken = (prefixes: string[]) => {
    const { session } = Auth.useUser();

    const { data: grants } = useSelectNew<CombinedGrantsExtQuery>(
        getGrantsForAuthToken()
    );

    const allowed_prefixes: string[] =
        grants?.data.map(({ object_role }) => object_role) ?? [];

    const authorized_prefixes = prefixes.filter((prefix) =>
        allowed_prefixes.find((allowed_prefix) =>
            prefix.startsWith(allowed_prefix)
        )
    );
    if (
        authorized_prefixes.length !== prefixes.length &&
        grants !== undefined
    ) {
        console.warn(
            'Attempt to fetch auth token for prefixes that you do not have permissions on: ',
            prefixes.filter((prefix) => !allowed_prefixes.includes(prefix))
        );
    }

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

    const response = useSWR(
        tokenExpired || authorized_prefixes.length > 0
            ? [
                  gatewayAuthTokenEndpoint,
                  authorized_prefixes,
                  session?.access_token,
              ]
            : null,
        fetcher,
        {
            onSuccess: ([config]) => {
                storeGatewayAuthConfig(config);
            },
            onError: (error) => {
                // TODO: Remove console.log call.
                console.error(error);
            },
        }
    );

    return { data: response.data?.[0], refresh: () => response.mutate() };
};

export default useGatewayAuthToken;
