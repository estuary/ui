import { client } from 'services/client';
import {
    getGatewayAuthTokenSettings,
    getSupabaseAnonymousKey,
} from 'utils/env-utils';

interface GatewayAuthTokenResponse {
    gateway_url: URL;
    token: string;
}

const { gatewayAuthTokenEndpoint } = getGatewayAuthTokenSettings();
const { supabaseAnonymousKey } = getSupabaseAnonymousKey();

const getGatewayAuthConfig = (
    prefixes: string[],
    sessionKey: string | undefined
): Promise<GatewayAuthTokenResponse[]> => {
    const headers: HeadersInit = {};

    headers.apikey = supabaseAnonymousKey;
    headers.Authorization = `Bearer ${sessionKey}`;
    headers['Content-Type'] = 'application/json';

    return client(gatewayAuthTokenEndpoint, {
        data: { prefixes },
        headers,
    });
};

export default getGatewayAuthConfig;
