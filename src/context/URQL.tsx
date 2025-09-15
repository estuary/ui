import type { BaseComponentProps } from 'src/types';

import { useMemo } from 'react';

import { authExchange } from '@urql/exchange-auth';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { DateTime } from 'luxon';
import { cacheExchange, Client, fetchExchange, Provider } from 'urql';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { AUTH_ERROR } from 'src/services/client';
import { getAuthHeader } from 'src/utils/misc-utils';

function UrqlConfigProvider({ children }: BaseComponentProps) {
    const [accessToken, expiresAt, refreshToken] = useUserStore((state) => [
        state.session?.access_token,
        state.session?.expires_at,
        state.session?.refresh_token,
    ]);

    const gqlClient = useMemo(() => {
        return new Client({
            url: import.meta.env.VITE_GQL_URL,
            // Sticking with POST calls for now
            preferGetMethod: false,
            exchanges: [
                // ORDER IS IMPORTANT
                requestPolicyExchange({
                    // We want to refetch things pretty aggressively but not so
                    //  aggresive that de-dupes won't happen.
                    ttl: 1000,
                }),
                cacheExchange,
                authExchange(async (utils) => {
                    // called on initial launch,
                    // fetch the auth state from storage (local storage, async storage etc)
                    // let refreshToken = localStorage.getItem('refreshToken');

                    return {
                        addAuthToOperation(operation) {
                            if (accessToken) {
                                return utils.appendHeaders(
                                    operation,
                                    getAuthHeader(`${accessToken}`)
                                );
                            }
                            return operation;
                        },
                        willAuthError(_operation) {
                            if (expiresAt && accessToken) {
                                return (
                                    DateTime.now().plus({
                                        // So we can refresh just a bit before we'll
                                        //  compare the expiration to 30 seconds from now
                                        seconds: 30,
                                    }) >= DateTime.fromSeconds(expiresAt)
                                );
                            }

                            // e.g. check for expiration, existence of auth etc
                            return true;
                        },
                        didAuthError(error, _operation) {
                            if (error.response.status === 401) {
                                return true;
                            }

                            // check if the error was an auth error
                            // this can be implemented in various ways, e.g. 401 or a special error code
                            return error.graphQLErrors.some(
                                (e) => e.extensions?.code === 'FORBIDDEN'
                            );
                        },
                        async refreshAuth() {
                            console.log('refreshAuth >>', refreshToken);

                            return Promise.reject({ message: AUTH_ERROR });
                            // called when auth error has occurred
                            // we should refresh the token with a GraphQL mutation or a fetch call,
                            // depending on what the API supports
                            // const result = await mutate(refreshMutation, {
                            //     token: authState?.refreshToken,
                            // });
                            // if (result.data?.refreshLogin) {
                            //     // save the new tokens in storage for next restart
                            //     token = result.data.refreshLogin.token;
                            //     refreshToken = result.data.refreshLogin.refreshToken;
                            //     localStorage.setItem('token', token);
                            //     localStorage.setItem('refreshToken', refreshToken);
                            // } else {
                            //     // otherwise, if refresh fails, log clear storage and log out
                            //     localStorage.clear();
                            //     logout();
                            // }
                        },
                    };
                }),
                fetchExchange,
            ],
        });
    }, [accessToken, expiresAt, refreshToken]);

    return <Provider value={gqlClient}>{children}</Provider>;
}

export default UrqlConfigProvider;
