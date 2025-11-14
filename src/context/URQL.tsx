import type { BaseComponentProps } from 'src/types';

import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';

import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { DateTime } from 'luxon';
import { Client, fetchExchange, Provider } from 'urql';

import { supabaseClient } from 'src/context/GlobalProviders';
import { useUserStore } from 'src/context/User/useUserContextStore';
import useDataFetchErrorHandling from 'src/hooks/useDataFetchErrorHandling';
import { logRocketEvent } from 'src/services/shared';
import { getAuthHeader } from 'src/utils/misc-utils';

function UrqlConfigProvider({ children }: BaseComponentProps) {
    const { checkIfAuthInvalid, forceUserToSignOut } =
        useDataFetchErrorHandling();

    const [accessToken, expiresAt, refreshToken] = useUserStore(
        useShallow((state) => [
            state.session?.access_token,
            state.session?.expires_at,
            state.session?.refresh_token,
        ])
    );

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
                        Alert: (data) =>
                            `${data.resolvedAt};${data.firedAt};${data.alertType};${data.catalogName}`,
                    },
                }),
                authExchange(async (utils) => {
                    return {
                        addAuthToOperation(operation) {
                            if (accessToken) {
                                return utils.appendHeaders(
                                    operation,
                                    getAuthHeader(accessToken)
                                );
                            }
                            return operation;
                        },
                        willAuthError() {
                            if (!expiresAt || !accessToken || !refreshToken) {
                                return true;
                            }

                            return (
                                DateTime.now() >=
                                DateTime.fromSeconds(expiresAt).minus({
                                    hours: 12, // Expire it just a bit early
                                })
                            );
                        },
                        didAuthError(error) {
                            if (
                                error.response?.status === 401 ||
                                checkIfAuthInvalid(error.message)
                            ) {
                                return true;
                            }

                            // TODO (GQL) - what other error handling do we need?
                            return error.graphQLErrors.some(
                                (e) => e.extensions?.code === 'FORBIDDEN'
                            );
                        },
                        async refreshAuth() {
                            // Only care about failures here.
                            //  The data returned is the new session. However, we will consume
                            //  that with `onAuthStateChange` in `src/context/User/index.tsx`
                            const { error } =
                                await supabaseClient.auth.refreshSession(
                                    refreshToken
                                        ? {
                                              refresh_token: refreshToken,
                                          }
                                        : undefined
                                );

                            logRocketEvent('Auth', {
                                refreshFailed: Boolean(error),
                                refreshStatus: error?.message ?? 'success',
                            });

                            if (error) {
                                return forceUserToSignOut('gql');
                            }

                            return Promise.resolve();
                        },
                    };
                }),
                fetchExchange,
            ],
        });
    }, [
        accessToken,
        checkIfAuthInvalid,
        expiresAt,
        forceUserToSignOut,
        refreshToken,
    ]);

    return <Provider value={gqlClient}>{children}</Provider>;
}

export default UrqlConfigProvider;
