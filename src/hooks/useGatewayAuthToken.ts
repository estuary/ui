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

interface RoleGrantsQuery {
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
    prefixes: string[]
): Promise<GatewayAuthTokenResponse[]> => {
    const headers: HeadersInit = {};

    const { supabaseAnonymousKey } = getSupabaseAnonymousKey();

    headers.apikey = supabaseAnonymousKey;
    headers.Authorization = `Bearer ${supabaseAnonymousKey}`;
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
    const roleQuery = useQuery<RoleGrantsQuery>(
        TABLES.ROLE_GRANTS,
        { columns: `id, object_role` },
        []
    );
    const { data: roles } = useSelect(roleQuery);

    const prefixes: string[] =
        roles?.data.map(({ object_role }) => object_role) ?? [];

    return useSWR([gatewayAuthTokenEndpoint, prefixes], fetcher, {
        onSuccess: ([{ gateway_url, token }]) => {
            getShardList(gateway_url, token, specs, setShards);
        },
        onError: (error) => {
            // TODO: Remove console.log call.
            console.log(error);
        },
    });
};

export default useGatewayAuthToken;
