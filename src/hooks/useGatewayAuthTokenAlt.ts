import { Auth } from '@supabase/ui';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { client } from 'services/client';
import { TABLES } from 'services/supabase';
import useSWR from 'swr';
import {
    getGatewayAuthTokenSettings,
    getSupabaseAnonymousKey,
} from 'utils/env-utils';

interface CombinedGrantsExtQuery {
    id: string;
    object_role: string;
}

interface GatewayAuthTokenResponse {
    gateway_url: URL;
    token: string;
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

const useGatewayAuthTokenAlt = () => {
    const { session } = Auth.useUser();

    const combinedGrantsQuery = useQuery<CombinedGrantsExtQuery>(
        TABLES.COMBINED_GRANTS_EXT,
        { columns: `id, object_role` },
        []
    );
    const { data: grants } = useSelect(combinedGrantsQuery);

    const prefixes: string[] =
        grants?.data.map(({ object_role }) => object_role) ?? [];

    const existingAuthToken = localStorage.getItem('auth-gateway-jwt');

    return useSWR(
        !existingAuthToken && prefixes.length > 0
            ? [gatewayAuthTokenEndpoint, prefixes, session?.access_token]
            : null,
        fetcher,
        {
            onSuccess: ([{ gateway_url, token }]) => {
                localStorage.setItem('gateway-url', gateway_url.toString());
                localStorage.setItem('auth-gateway-jwt', token);
            },
            onError: (error) => {
                // TODO: Remove console.log call.
                console.log(error);
            },
        }
    );
};

export default useGatewayAuthTokenAlt;
