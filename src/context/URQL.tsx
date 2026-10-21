import type { Cache } from '@urql/exchange-graphcache';
import type {
    DeleteBillingPaymentMethodMutation,
    QueryRoot,
    SetBillingPaymentMethodMutation,
} from 'src/gql-types/graphql';
import type { BaseComponentProps } from 'src/types';

import { useMemo } from 'react';

import { cacheExchange } from '@urql/exchange-graphcache';
import { requestPolicyExchange } from '@urql/exchange-request-policy';
import { Client, fetchExchange, Provider } from 'urql';

import { TENANT_BILLING_PAYMENT_METHODS_QUERY } from 'src/api/gql/billing';
import { authedFetch } from 'src/services/gql';
import { getGqlUrl } from 'src/utils/env-utils';

function invalidateQuery(
    cache: Cache,
    queryName: Exclude<keyof QueryRoot, '__typename'>
) {
    cache
        .inspectFields('Query')
        .filter((f) => f.fieldName === queryName)
        .forEach((f) => cache.invalidate('Query', f.fieldName, f.arguments));
}

function updateBillingPaymentMethods(
    cache: Cache,
    tenant: string,
    billing: SetBillingPaymentMethodMutation['setBillingPaymentMethod']
) {
    cache.updateQuery(
        {
            query: TENANT_BILLING_PAYMENT_METHODS_QUERY,
            variables: { tenant },
        },
        (data) =>
            data?.tenant
                ? {
                      ...data,
                      tenant: {
                          ...data.tenant,
                          billing: {
                              ...data.tenant.billing,
                              primaryPaymentMethod:
                                  billing.primaryPaymentMethod,
                              paymentMethods: billing.paymentMethods,
                          },
                      },
                  }
                : data
    );
}

export function UrqlConfigProvider({ children }: BaseComponentProps) {
    const gqlClient = useMemo(() => {
        return new Client({
            url: getGqlUrl(),
            fetch: authedFetch,
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
                    resolvers: {
                        Query: {
                            // A failed billing read caches `tenant: null`
                            // without its error. Treat it as uncached, so
                            // returning to the tenant reads it again instead
                            // of showing empty billing data.
                            tenant: (_parent, args, cache) =>
                                cache.resolve('Query', 'tenant', args) ??
                                undefined,
                        },
                    },
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
                        StorageMapping: (_data) => null,
                        DataPlane: (_data) => null,
                        PublicDataPlane: (data) => data.name as string,
                        CatalogStats: (_data) => null,
                        CatalogStatsSummary: (_data) => null,
                        DocsAndBytes: (_data) => null,
                        CatalogTaskStats: (_data) => null,
                        CaptureBindingStats: (_data) => null,
                        MaterializeBindingStats: (_data) => null,
                        Tenant: (_data) => null,
                        TenantBilling: (_data) => null,
                        Invoice: (_data) => null,
                        PaymentMethodBillingDetails: (_data) => null,
                        CardPaymentMethodDetails: (_data) => null,
                        UsBankAccountPaymentMethodDetails: (_data) => null,
                        BillingPaymentMethodPayload: (_data) => null,
                        CreateBillingSetupIntentPayload: (_data) => null,
                    },
                    // Normalization only merges update results into entities
                    // already in the cache. Creates and deletes need updaters
                    // here: a new entity does not join cached lists and a
                    // deleted one is not evicted on its own.
                    updates: {
                        Mutation: {
                            setBillingPaymentMethod(result, args, cache) {
                                updateBillingPaymentMethods(
                                    cache,
                                    args.tenant as string,
                                    (result as SetBillingPaymentMethodMutation)
                                        .setBillingPaymentMethod
                                );
                            },
                            deleteBillingPaymentMethod(result, args, cache) {
                                updateBillingPaymentMethods(
                                    cache,
                                    args.tenant as string,
                                    (
                                        result as DeleteBillingPaymentMethodMutation
                                    ).deleteBillingPaymentMethod
                                );
                            },
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
                fetchExchange,
            ],
        });
        // No deps so client is created only once (recreating would drop the cache).
    }, []);

    return <Provider value={gqlClient}>{children}</Provider>;
}
