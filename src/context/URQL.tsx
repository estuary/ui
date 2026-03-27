import type { BaseComponentProps } from 'src/types';

import { useMemo, useRef } from 'react';

import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { Client, fetchExchange, Provider } from 'urql';

import { useUserStore } from 'src/context/User/useUserContextStore';
import useDataFetchErrorHandling from 'src/hooks/useDataFetchErrorHandling';
import { logRocketEvent } from 'src/services/shared';
import { getAuthHeader } from 'src/utils/misc-utils';

function UrqlConfigProvider({ children }: BaseComponentProps) {
    const { checkIfAuthInvalid } = useDataFetchErrorHandling();

    const accessToken = useUserStore((state) => state.session?.access_token);

    // Ref so the auth exchange always reads the latest token
    // without recreating the client (which would drop the cache).
    const accessTokenRef = useRef(accessToken);
    accessTokenRef.current = accessToken;

    const gqlClient = useMemo(() => {
        return new Client({
            url: import.meta.env.VITE_GQL_URL,
            preferGetMethod: false,
            exchanges: [
                // WARNING - order is important on exchanges

                requestPolicyExchange({
                    // Want to refetch pretty aggressively while still getting de-dupe functionality.
                    ttl: 30000,
                }),
                cacheExchange({
                    // If we end up wanting to use URQL built in pagination
                    // directives: {
                    //     relayPagination: (options) =>
                    //         relayPagination({ ...options }),
                    // },
                    // resolvers: {
                    //     Query: {
                    //         alerts: relayPagination(),
                    //     },
                    // },
                    keys: {
                        // TODO (gql caching)  - see GRAPHQL.md
                        Alert: (_data) => null,
                        LiveSpecRef: (_data) => null,
                        PrefixRef: (_data) => null,
                        StorageMapping: (data) => null,
                        DataPlane: (data) => null,
                    },
                }),
                authExchange(async (utils) => {
                    return {
                        addAuthToOperation(operation) {
                            const token = accessTokenRef.current;

                            if (token) {
                                return utils.appendHeaders(
                                    operation,
                                    getAuthHeader(token)
                                );
                            }
                            return operation;
                        },
                        willAuthError() {
                            return !accessTokenRef.current;
                        },
                        didAuthError(error) {
                            const isAuthError =
                                error.response?.status === 401 ||
                                checkIfAuthInvalid(error.message) ||
                                error.graphQLErrors.some(
                                    (e) => e.extensions?.code === 'FORBIDDEN'
                                );

                            if (isAuthError) {
                                logRocketEvent('Auth', {
                                    gqlAuthError: true,
                                    status: error.response?.status,
                                    message: error.message,
                                });
                            }

                            return isAuthError;
                        },
                        async refreshAuth() {
                            // No-op: Supabase handles token refresh automatically.
                            // When it refreshes, onAuthStateChange updates the store,
                            // and the ref picks up the new token immediately.
                        },
                    };
                }),
                fetchExchange,
            ],
        });
        // Client created once — auth exchange reads token from ref, not closure.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkIfAuthInvalid]);

    return <Provider value={gqlClient}>{children}</Provider>;
}

export default UrqlConfigProvider;
