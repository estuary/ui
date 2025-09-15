import type { BaseComponentProps } from 'src/types';

import { useMemo } from 'react';

import { createClient } from '@supabase/supabase-js';
import { authExchange } from '@urql/exchange-auth';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { enableMapSet, setAutoFreeze } from 'immer';
import { cacheExchange, Client, fetchExchange, Provider } from 'urql';

import FullPageSpinner from 'src/components/fullPage/Spinner';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { initLogRocket } from 'src/services/logrocket';
import { getAuthHeader } from 'src/utils/misc-utils';

// This is not a normal provider... more like a guard... kind of. This is here so that we know createClient is called early and also
//  so it is called in a somewhat consistent order. This is also waiting until the client has been
//  constructed before letting the application start rendering.

if (
    !import.meta.env.VITE_SUPABASE_URL ||
    !import.meta.env.VITE_SUPABASE_ANON_KEY ||
    !import.meta.env.VITE_GQL_URL
) {
    throw new Error(
        'Missing at least 1 endpoint config: [VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GQL_URL]'
    );
}

// Put global initializing code early. The LogRocket one _MUST_ be done
//  before the `createClient` call made below for Supabase
initLogRocket();

// Setup immer
enableMapSet();
setAutoFreeze(false);

// Setup Supabase
const supabaseSettings = {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export const supabaseClient = createClient(
    supabaseSettings.url,
    supabaseSettings.anonKey
);

function GlobalProviders({ children }: BaseComponentProps) {
    const initialized = useUserStore((state) => state.initialized);

    const accessToken = useUserStore((state) => state.session?.access_token);

    const gqlClient = useMemo(() => {
        console.log('getting GQL client', accessToken);
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
                                    getAuthHeader(accessToken)
                                );
                            }
                            return operation;
                        },
                        willAuthError(_operation) {
                            // e.g. check for expiration, existence of auth etc
                            return !accessToken;
                        },
                        didAuthError(error, _operation) {
                            // check if the error was an auth error
                            // this can be implemented in various ways, e.g. 401 or a special error code
                            return error.graphQLErrors.some(
                                (e) => e.extensions?.code === 'FORBIDDEN'
                            );
                        },
                        async refreshAuth() {
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
    }, [accessToken]);

    if (!initialized) {
        return <FullPageSpinner />;
    }

    // Only returning the child and need the JSX Fragment
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <Provider value={gqlClient}>{children}</Provider>;
}

export default GlobalProviders;
