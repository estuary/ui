import type { Cache } from '@urql/exchange-graphcache';
import type { QueryRoot } from 'src/gql-types/graphql';
import type { BaseComponentProps } from 'src/types';

import { useMemo, useRef } from 'react';

import { authExchange } from '@urql/exchange-auth';
import { cacheExchange } from '@urql/exchange-graphcache';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { Client, fetchExchange, Provider } from 'urql';

import { useUserStore } from 'src/context/User/useUserContextStore';
import { getGqlUrl } from 'src/utils/env-utils';
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
            url: getGqlUrl(),
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
                    // Migration: replace these null keys with real keys — `id`
                    // where the schema has one, otherwise a natural key
                    // (catalogPrefix, token, catalogName, ...). A null key
                    // embeds the object in its parent query result, so
                    // mutation results never merge into other cached queries.
                    // Keep null only for value objects with no identity
                    // (EffectiveAlertConfig, FieldProvenance). Queries and
                    // mutations must select the key fields.
                    keys: {
                        Alert: (_data) => null,
                        AlertConfig: (_data) => null,
                        AlertSubscription: (_data) => null,
                        AlertTypeInfo: (_data) => null,
                        EffectiveAlertConfig: (_data) => null,
                        FieldProvenance: (_data) => null,
                        InviteLink: (data) => null,
                        LiveSpecRef: (_data) => null,
                        PrefixRef: (_data) => null,
                        RefreshTokenInfo: (_data) => null,
                        StorageMapping: (data) => null,
                        DataPlane: (data) => null,
                    },
                    // Normalization only merges update results into entities
                    // already in the cache. Creates and deletes need updaters
                    // here: a new entity does not join cached lists and a
                    // deleted one is not evicted on its own.
                    updates: {
                        Mutation: {
                            createInviteLink(_result, _args, cache) {
                                invalidateQuery(cache, 'inviteLinks');
                            },
                            deleteInviteLink(_result, _args, cache) {
                                invalidateQuery(cache, 'inviteLinks');
                            },
                            updateAlertConfig(_result, _args, cache) {
                                invalidateQuery(cache, 'alertConfigs');
                            },
                            createAlertSubscription(_result, _args, cache) {
                                invalidateQuery(cache, 'alertSubscriptions');
                            },
                            deleteAlertSubscription(_result, _args, cache) {
                                invalidateQuery(cache, 'alertSubscriptions');
                            },
                            updateAlertSubscription(_result, _args, cache) {
                                invalidateQuery(cache, 'alertSubscriptions');
                            },
                            createRefreshToken(_result, _args, cache) {
                                invalidateQuery(cache, 'refreshTokens');
                            },
                            revokeRefreshToken(_result, _args, cache) {
                                invalidateQuery(cache, 'refreshTokens');
                            },
                            createStorageMapping(_result, _args, cache) {
                                invalidateQuery(cache, 'storageMappings');
                            },
                            updateStorageMapping(_result, _args, cache) {
                                invalidateQuery(cache, 'storageMappings');
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
