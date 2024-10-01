import { useUserStore } from 'context/User/useUserContextStore';
import { decodeJwt, JWTPayload } from 'jose';
import useSWR from 'swr';
import { authorizeTask } from 'utils/dataPlane-utils';
import { getURL, hasLength } from 'utils/misc-utils';

interface Token {
    gateway_url: URL | null;
    parsed: JWTPayload;
    token: string;
}

type FetcherArgs = [string, string, string | undefined];
const fetcher = async ({
    0: catalogName,
    1: sessionKey,
}: FetcherArgs): Promise<Token> => {
    const response = await authorizeTask(sessionKey, catalogName);

    if (
        !hasLength(response.reactorToken) ||
        !hasLength(response.reactorAddress)
    ) {
        throw new Error('data-plane auth token response was empty');
    }
    const { reactorAddress, reactorToken } = response;

    const parsed = decodeJwt(reactorToken);

    return {
        token: reactorToken,
        gateway_url: getURL(
            reactorAddress,
            `useReactorToken : 'reactor_address' cannot be parsed as a URL`
        ),
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
            throw new Error('data-plane JWT is missing exp');
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

// Returns an auth token for accessing the provided `prefix` scope in the data plane.
// This token is not stored in local storage.
const useReactorToken = (prefix: string | null) => {
    const session = useUserStore((state) => state.session);

    const { data, error } = useSWR(
        prefix === null ? null : [prefix, session?.access_token],
        fetcher,
        { refreshInterval: getTokenRefreshInterval }
    );
    if (error) {
        console.error('fetching scoped data-plane access token: ', error);
    }

    return {
        gatewayAuthToken: data?.token,
        gatewayUrl: data?.gateway_url,
        error,
    };
};

export default useReactorToken;
