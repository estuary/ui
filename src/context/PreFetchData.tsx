import { Auth } from '@supabase/ui';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { createContext } from 'react';
import { client } from 'services/client';
import { TABLES } from 'services/supabase';
import { BaseComponentProps } from 'types';
import {
    getGatewayAuthTokenSettings,
    getSupabaseAnonymousKey,
} from 'utils/env-utils';

// TODO: Determine if this approach is worth keeping around. The logic in this file is a WIP.

interface CombinedGrantsExtQuery {
    id: string;
    object_role: string;
}

interface GatewayAuthTokenResponse {
    gateway_url: URL;
    token: string;
}

const getGatewayAuthConfig = (
    prefixes: string[],
    sessionKey: string | undefined
): Promise<GatewayAuthTokenResponse[]> => {
    const { gatewayAuthTokenEndpoint } = getGatewayAuthTokenSettings();
    const { supabaseAnonymousKey } = getSupabaseAnonymousKey();

    const headers: HeadersInit = {};

    headers.apikey = supabaseAnonymousKey;
    headers.Authorization = `Bearer ${sessionKey}`;
    headers['Content-Type'] = 'application/json';

    return client(gatewayAuthTokenEndpoint, {
        data: { prefixes },
        headers,
    });
};

const PreFetchDataContext = createContext(null);

const PreFetchDataContextProvider = ({ children }: BaseComponentProps) => {
    const { session } = Auth.useUser();

    const combinedGrantsQuery = useQuery<CombinedGrantsExtQuery>(
        TABLES.COMBINED_GRANTS_EXT,
        { columns: `id, object_role` },
        []
    );
    const { data: grants } = useSelect(combinedGrantsQuery);

    const prefixes: string[] =
        grants?.data.map(({ object_role }) => object_role) ?? [];

    if (!localStorage.getItem('auth-gateway-jwt') && prefixes.length > 0) {
        getGatewayAuthConfig(prefixes, session?.access_token)
            .then(([{ gateway_url, token }]) => {
                localStorage.setItem('gateway-url', gateway_url.toString());
                localStorage.setItem('auth-gateway-jwt', token);
            })
            .catch((error) => Promise.reject(error));
    }

    return (
        <PreFetchDataContext.Provider value={null}>
            {children}
        </PreFetchDataContext.Provider>
    );
};

export default PreFetchDataContextProvider;
