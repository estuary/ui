import { Auth } from '@supabase/ui';
import { decodeJwt } from 'jose';
import { client } from 'services/client';
import useSWR from 'swr';
import { GatewayAuthTokenResponse } from 'types';
import {
    getGatewayAuthTokenSettings,
    getSupabaseAnonymousKey,
} from 'utils/env-utils';

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

// Returns the refresh interval in milliseconds for a given auth token response. SWR will re-fetch
// this token automatically after this refresh interval, so we determine it based on the expiration
// of the JWT.
const getTokenRefreshInterval = (
    tokens: GatewayAuthTokenResponse[] | undefined
): number => {
    if (!tokens) {
        return 0;
    }
    const refreshIntervals = tokens.map((data) => {
        try {
            const parsed = decodeJwt(data.token);
            if (!parsed.exp) {
                throw new Error('data plane JWT is missing exp');
            }
            // JWT date is in seconds, while Date.now and SWR use millis.
            const exp = parsed.exp * 1000;
            const now = Date.now();
            if (now >= exp) {
                console.error('data-plane JWT is expired', {
                    now,
                    data,
                });
                return 0;
            } else {
                // Take 20% off the validity duration so that we refresh the token slightly
                // before it's actually expired.
                const newInt = Math.max(1, Math.round((exp - now) * 0.8));
                return newInt;
            }
        } catch (e: unknown) {
            console.error('failed to parse data-plane JWT', e);
            // Try again in 10 seconds if the token appears invalid
            return 10000;
        }
    });
    // As of when this was written, we don't ever have more than one token coming back
    // in any response, so it's not clear that this is actually the best way to handle
    // that case, or if it will even matter.
    return Math.min(...refreshIntervals);
};

// Returns an auth token for accessing the provided `prefixes` scopes in the data plane.
// This token is not stored in local storage.
const useScopedGatewayAuthToken = (prefixes: string[] | null) => {
    const { session } = Auth.useUser();
    const { data, error } = useSWR(
        prefixes === null
            ? null
            : [gatewayAuthTokenEndpoint, prefixes, session?.access_token],
        fetcher,
        { refreshInterval: getTokenRefreshInterval }
    );
    if (error) {
        console.error('fetching scoped data-plane access token: ', error);
    }
    const result = data ? data[0] : null;

    return { data: result, error };
};

export default useScopedGatewayAuthToken;
