import { Auth } from '@supabase/ui';
import { isBefore } from 'date-fns';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { decodeJwt, JWTPayload } from 'jose';
import { client } from 'services/client';
import { TABLES } from 'services/supabase';
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

const useGatewayAuthToken = () => {
    const { session } = Auth.useUser();

    const combinedGrantsQuery = useQuery<CombinedGrantsExtQuery>(
        TABLES.COMBINED_GRANTS_EXT,
        { columns: `id, object_role` },
        []
    );
    const { data: grants } = useSelect(combinedGrantsQuery);

    const prefixes: string[] =
        grants?.data.map(({ object_role }) => object_role) ?? [];

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
