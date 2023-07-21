import { decodeJwt, JWTPayload } from 'jose';
import useSWR from 'swr';
import { GatewayAuthTokenResponse } from 'types';

import { Auth } from '@supabase/ui';

import { client } from 'services/client';

import {
    getGatewayAuthTokenSettings,
    getSupabaseAnonymousKey,
} from 'utils/env-utils';

const { gatewayAuthTokenEndpoint } = getGatewayAuthTokenSettings();

export interface Token {
    token: string;
    gateway_url: URL;
    parsed: JWTPayload;
}

// The request body for this API is a string array corresponding to the prefixes a user has access to.
const fetcher = async (
    endpoint: string,
    prefix: string,
    sessionKey: string | undefined
): Promise<Token> => {
    const headers: HeadersInit = {};

    const { supabaseAnonymousKey } = getSupabaseAnonymousKey();

    headers.apikey = supabaseAnonymousKey;
    headers.Authorization = `Bearer ${sessionKey}`;
    headers['Content-Type'] = 'application/json';

    const response: GatewayAuthTokenResponse[] = await client(endpoint, {
        data: { prefixes: [prefix] },
        headers,
    });

    if (response.length === 0) {
        throw new Error('data-plane auth token response was empty');
    }
    const data = response[0];

    const parsed = decodeJwt(data.token);
    // If the user doesn't have access to the requested scopes, then they won't be present.
    // Since we know we're only requesting a single scope, prefixes.length should always be 1
    if (!Array.isArray(parsed.prefixes) || parsed.prefixes.length !== 1) {
        throw new Error('you are not authorized to the requested scopes');
    }
    return {
        token: data.token,
        gateway_url: data.gateway_url,
        parsed,
    };
};

// Returns the refresh interval in milliseconds for a given auth token response. SWR will re-fetch
// this token automatically after this refresh interval, so we determine it based on the expiration
// of the JWT.
const getTokenRefreshInterval = (token: Token | undefined): number => {
    if (!token) {
        return 0;
    }

    try {
        if (!token.parsed.exp) {
            throw new Error('data plane JWT is missing exp');
        }
        // JWT date is in seconds, while Date.now and SWR use millis.
        const exp = token.parsed.exp * 1000;
        const now = Date.now();
        if (now >= exp) {
            console.error('data-plane JWT is expired', {
                now,
                token,
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
};

// Returns an auth token for accessing the provided `prefixes` scopes in the data plane.
// This token is not stored in local storage.
const useScopedGatewayAuthToken = (prefix: string | null) => {
    const { session } = Auth.useUser();
    const { data, error } = useSWR(
        prefix === null
            ? null
            : [gatewayAuthTokenEndpoint, prefix, session?.access_token],
        fetcher,
        { refreshInterval: getTokenRefreshInterval }
    );
    if (error) {
        console.error('fetching scoped data-plane access token: ', error);
    }

    return { data, error };
};

export default useScopedGatewayAuthToken;
