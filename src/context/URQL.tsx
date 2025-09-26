import type { BaseComponentProps } from 'src/types';

import { useMemo } from 'react';

import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { DateTime } from 'luxon';
import { Client, fetchExchange, Provider } from 'urql';

import { useUserStore } from 'src/context/User/useUserContextStore';
import useDataFetchErrorHandling from 'src/hooks/useDataFetchErrorHandling';
import { getAuthHeader } from 'src/utils/misc-utils';

function UrqlConfigProvider({ children }: BaseComponentProps) {
    const { checkIfAuthInvalid, forceUserToSignOut } =
        useDataFetchErrorHandling();

    const [accessToken, expiresAt] = useUserStore((state) => [
        state.session?.access_token,
        state.session?.expires_at,
    ]);

    const gqlClient = useMemo(() => {
        return new Client({
            url: import.meta.env.VITE_GQL_URL,
            preferGetMethod: false,
            exchanges: [
                // WARNING - order is important on exchanges

                requestPolicyExchange({
                    // Want to refetch pretty aggressively while still getting de-dupe functionality.
                    ttl: 1000,
                }),
                cacheExchange({
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
                            if (expiresAt && accessToken) {
                                return (
                                    DateTime.now() >=
                                    DateTime.fromSeconds(expiresAt)
                                );
                            }

                            return true;
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
                            return forceUserToSignOut('gql');
                        },
                    };
                }),
                fetchExchange,
            ],
        });
    }, [accessToken, checkIfAuthInvalid, expiresAt, forceUserToSignOut]);

    return <Provider value={gqlClient}>{children}</Provider>;
}

export default UrqlConfigProvider;
