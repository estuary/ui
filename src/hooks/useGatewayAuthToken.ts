import { Auth } from '@supabase/ui';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { client } from 'services/client';
import getShardList from 'services/shard-client';
import { TABLES } from 'services/supabase';
import useSWR from 'swr';
import { LiveSpecsExtBaseQuery } from 'types';
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

const useGatewayAuthToken = <T extends LiveSpecsExtBaseQuery>(
    specs: T[],
    setShards: any
) => {
    const { session } = Auth.useUser();

    const combinedGrantsQuery = useQuery<CombinedGrantsExtQuery>(
        TABLES.COMBINED_GRANTS_EXT,
        { columns: `id, object_role` },
        []
    );
    const { data: grants } = useSelect(combinedGrantsQuery);

    const prefixes: string[] =
        grants?.data.map(({ object_role }) => object_role) ?? [];

    return useSWR(
        [gatewayAuthTokenEndpoint, prefixes, session?.access_token],
        fetcher,
        {
            onSuccess: ([{ gateway_url, token }]) => {
                getShardList(gateway_url, token, specs, setShards);
            },
            onError: (error) => {
                // TODO: Remove console.log call.
                console.log(error);
            },
        }
    );
};

export default useGatewayAuthToken;
