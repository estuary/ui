import type { AlertSubscriptionsQuery } from 'src/gql-types/graphql';
import type { CombinedError } from 'urql';

import { useCallback } from 'react';

import { useClient, useQuery } from 'urql';

import {
    AlertConfigUpdateMutation,
    AlertSubscriptionQuery,
} from 'src/api/alerts';
import {
    BILLING_ALERT_ACTIVE_QUERY,
    BILLING_ALERT_CONFIG_QUERY,
} from 'src/api/gql/billingAlert';

const ALERT_TYPE = 'billing_threshold_exceeded';

interface BillingThresholdConfig {
    enabled?: boolean;
    condition?: { usdCents: number };
}

// A prefix's alert config. The other keys hold its other alert settings.
export interface AlertConfig {
    billingThresholdExceeded?: BillingThresholdConfig;
    [key: string]: unknown;
}

export interface SpendAlertWriteResult {
    error?: CombinedError;
}

// The tenant controller ignores a config without an amount and treats a
// missing `enabled` as on.
export function readSpendAlert(config: AlertConfig | undefined) {
    const amountCents =
        config?.billingThresholdExceeded?.condition?.usdCents ?? null;

    return {
        amountCents,
        enabled:
            amountCents !== null &&
            config?.billingThresholdExceeded?.enabled !== false,
    };
}

// `updateAlertConfig` replaces the row's whole config, so the prefix's other
// alert settings are written back unchanged.
export function withSpendAlert(
    config: AlertConfig | undefined,
    billingThresholdExceeded: BillingThresholdConfig
): AlertConfig {
    return { ...config, billingThresholdExceeded };
}

// Tenant alerts are named `{tenant}alerts/{alert_type}`.
const spendAlertName = (tenant: string) => `${tenant}alerts/${ALERT_TYPE}`;

// Matches the server's choice of recipients: subscriptions with an email,
// whose prefix contains the alert's name and whose types include the alert.
export function hasSpendAlertRecipients(
    subscriptions: AlertSubscriptionsQuery['alertSubscriptions'],
    tenant: string
) {
    const name = spendAlertName(tenant);

    return subscriptions.some(
        ({ alertTypes, catalogPrefix, email }) =>
            Boolean(email) &&
            name.startsWith(catalogPrefix) &&
            alertTypes.includes(ALERT_TYPE)
    );
}

interface Options {
    // Listing subscriptions needs alert management rights, which billing
    // access does not imply, so only callers that can edit ask for them.
    checkRecipients?: boolean;
}

export function useSpendAlert(
    tenant: string,
    { checkRecipients = false }: Options = {}
) {
    const client = useClient();

    const [configQuery] = useQuery({
        query: BILLING_ALERT_CONFIG_QUERY,
        variables: { tenant },
    });
    const [alertQuery] = useQuery({
        query: BILLING_ALERT_ACTIVE_QUERY,
        variables: { name: spendAlertName(tenant) },
    });
    const [subscriptionsQuery] = useQuery({
        query: AlertSubscriptionQuery,
        variables: { prefix: tenant },
        pause: !checkRecipients,
    });

    const { amountCents, enabled } = readSpendAlert(
        configQuery.data?.alertConfigs.edges[0]?.node.config
    );

    const alert = alertQuery.data?.alerts.edges.find(
        ({ node }) => node.alertType === ALERT_TYPE
    )?.node;
    const firedAmountCents = alert?.arguments?.threshold_usd_cents;

    const write = useCallback(
        async (
            update: (
                current: BillingThresholdConfig | undefined
            ) => BillingThresholdConfig
        ): Promise<SpendAlertWriteResult> => {
            // Merge into the row as stored now rather than as this page last
            // read it, so settings changed elsewhere since are kept.
            const latest = await client
                .query(
                    BILLING_ALERT_CONFIG_QUERY,
                    { tenant },
                    { requestPolicy: 'network-only' }
                )
                .toPromise();
            if (latest.error) {
                return { error: latest.error };
            }

            const current: AlertConfig | undefined =
                latest.data?.alertConfigs.edges[0]?.node.config;
            const result = await client
                .mutation(AlertConfigUpdateMutation, {
                    catalogPrefixOrName: tenant,
                    config: withSpendAlert(
                        current,
                        update(current?.billingThresholdExceeded)
                    ),
                })
                .toPromise();

            return { error: result.error };
        },
        [client, tenant]
    );

    const save = useCallback(
        (cents: number) =>
            write(() => ({ enabled: true, condition: { usdCents: cents } })),
        [write]
    );

    // Writes `enabled: false` rather than removing the key: a write that
    // includes the key wakes the tenant controller, which resolves an open
    // alert right away instead of at its next hourly check.
    const disable = useCallback(
        () => write((current) => ({ ...current, enabled: false })),
        [write]
    );

    return {
        // Kept after Disable, so Set Up can offer it again. Only `enabled`
        // says whether the alert is on.
        amountCents,
        enabled,
        // When the open alert fired, and the amount it fired at.
        firedAt: alert?.firedAt,
        firedAmountCents:
            typeof firedAmountCents === 'number' ? firedAmountCents : undefined,
        hasRecipients: subscriptionsQuery.data
            ? hasSpendAlertRecipients(
                  subscriptionsQuery.data.alertSubscriptions,
                  tenant
              )
            : undefined,
        loading:
            (configQuery.fetching && !configQuery.data) ||
            (alertQuery.fetching && !alertQuery.data) ||
            (subscriptionsQuery.fetching && !subscriptionsQuery.data),
        // The open alert and the recipients only refine the card's copy, so
        // their errors leave those details out instead of failing the card.
        error: configQuery.error,
        save,
        disable,
    };
}
