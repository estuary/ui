import type { Cache } from '@urql/exchange-graphcache';
import type { QueryRoot } from 'src/gql-types/graphql';
import type { BaseComponentProps } from 'src/types';

import { useMemo, useRef } from 'react';

import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { Client, fetchExchange, Provider } from 'urql';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { getAuthHeader } from 'src/utils/misc-utils';

function invalidateQuery(
    cache: Cache,
    queryName: Exclude<keyof QueryRoot, '__typename'>
) {
    cache
        .inspectFields('Query')
        .filter((f) => f.fieldName === queryName)
        .forEach((f) => cache.invalidate('Query', f.fieldName, f.arguments));
}

function UrqlConfigProvider({ children }: BaseComponentProps) {
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
                        AlertSubscription: (_data) => null,
                        AlertTypes: (_data) => null,
                        InviteLink: (data) => null,
                        LiveSpecRef: (_data) => null,
                        PrefixRef: (_data) => null,
                        StorageMapping: (data) => null,
                        DataPlane: (data) => null,
                    },
                    updates: {
                        Mutation: {
                            createInviteLink(_result, _args, cache) {
                                invalidateQuery(cache, 'inviteLinks');
                            },
                            deleteInviteLink(_result, _args, cache) {
                                invalidateQuery(cache, 'inviteLinks');
                            },
                        },
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
                        didAuthError() {
                            // Always false — Supabase handles token refresh.
                            // Returning true would trigger refreshAuth (a no-op),
                            // causing URQL to retry with the same stale token.
                            return false;
                        },
                        async refreshAuth() {
                            // No-op — Supabase's onAuthStateChange updates the
                            // store and the ref picks up the new token automatically.
                        },
                    };
                }),
                fetchExchange,
            ],
        });
        // Client created once — auth exchange reads token from ref, not closure.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <Provider value={gqlClient}>{children}</Provider>;
}

export default UrqlConfigProvider;
