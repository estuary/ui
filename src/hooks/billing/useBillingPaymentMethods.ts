import type { PaymentMethodProps } from 'src/components/admin/Billing/PaymentMethodRow';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { useClient, useMutation, useQuery } from 'urql';

import {
    CREATE_BILLING_SETUP_INTENT,
    DELETE_BILLING_PAYMENT_METHOD,
    SET_BILLING_PAYMENT_METHOD,
    TENANT_BILLING_PAYMENT_METHODS_QUERY,
} from 'src/api/gql/billing';
import {
    INTENT_SECRET_ERROR,
    INTENT_SECRET_LOADING,
} from 'src/components/admin/Billing/shared';
import { useTenantStore } from 'src/stores/Tenant';

// The data the billing table needs per method. `onDelete`, `onPrimary`, and
// `primary` are injected by the table when it renders each row.
export type BillingPaymentMethod = Omit<
    PaymentMethodProps,
    'onDelete' | 'onPrimary' | 'primary'
>;

interface PaymentMethodNode {
    id: string;
    type: string;
    billingDetails: { name?: string | null };
    card?: {
        brand?: string | null;
        last4?: string | null;
        expMonth: number;
        expYear: number;
    } | null;
    usBankAccount?: {
        bankName?: string | null;
        last4?: string | null;
    } | null;
}

// The GQL node is camelCased and narrower than the legacy REST payload. Map
// what the schema provides into the shape the table renders.
const mapPaymentMethod = (node: PaymentMethodNode): BillingPaymentMethod => ({
    id: node.id,
    type: node.type,
    billing_details: {
        name: node.billingDetails?.name ?? '',
    },
    card: {
        brand: (node.card?.brand ??
            'unknown') as PaymentMethodProps['card']['brand'],
        exp_month: node.card?.expMonth ?? 0,
        exp_year: node.card?.expYear ?? 0,
        last4: node.card?.last4 ?? '',
    },
    us_bank_account: {
        bank_name: node.usBankAccount?.bankName ?? '',
        last4: node.usBankAccount?.last4 ?? '',
    },
});

export interface UseBillingPaymentMethodsResult {
    methods: BillingPaymentMethod[];
    // The id of the primary method, for the table to flag the right row.
    primaryId: string | null;
    isLoading: boolean;
    serverErrored: boolean;
    // The Stripe SetupIntent client secret for the Add dialog, or one of the
    // INTENT_SECRET_* sentinels while loading or on failure.
    setupIntentSecret: string;
    // Promote a method to primary; resolves to whether it succeeded.
    setPrimary: (id: string) => Promise<boolean>;
    // Remove a method; resolves to whether it succeeded.
    deleteMethod: (id: string) => Promise<boolean>;
    // Re-fetch the list (used after the Stripe form adds a card).
    refresh: () => void;
}

// Fetches and mutates the selected tenant's payment methods via GraphQL. urql
// keys its cache on the query variables, so switching tenants re-runs the query
// and the previous tenant's data is never shown. The set/delete mutations only
// confirm the new primary, so the list is explicitly re-fetched after each.
export function useBillingPaymentMethods(): UseBillingPaymentMethodsResult {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const client = useClient();

    const [{ data, fetching, error }] = useQuery({
        query: TENANT_BILLING_PAYMENT_METHODS_QUERY,
        variables: { tenant: selectedTenant },
        pause: !selectedTenant,
    });

    const [, setBillingPaymentMethod] = useMutation(SET_BILLING_PAYMENT_METHOD);
    const [, deleteBillingPaymentMethod] = useMutation(
        DELETE_BILLING_PAYMENT_METHOD
    );
    const [, createBillingSetupIntent] = useMutation(
        CREATE_BILLING_SETUP_INTENT
    );

    // Re-fetch the list and resolve once it has loaded. Writing through the
    // shared urql cache updates the live query above, so callers can await this
    // before acting on the refreshed list (e.g. dismissing the delete dialog).
    const refresh = useCallback(
        () =>
            client
                .query(
                    TENANT_BILLING_PAYMENT_METHODS_QUERY,
                    { tenant: selectedTenant },
                    { requestPolicy: 'network-only' }
                )
                .toPromise(),
        [client, selectedTenant]
    );

    // Pre-warm the Stripe SetupIntent so the Add dialog has a client secret
    // ready when it opens; re-created whenever the tenant changes.
    const [setupIntentSecret, setSetupIntentSecret] =
        useState(INTENT_SECRET_LOADING);

    useEffect(() => {
        if (!selectedTenant) {
            return;
        }

        setSetupIntentSecret(INTENT_SECRET_LOADING);

        void createBillingSetupIntent({ tenant: selectedTenant }).then(
            (result) => {
                setSetupIntentSecret(
                    result.data?.createBillingSetupIntent.clientSecret ??
                        INTENT_SECRET_ERROR
                );
            },
            () => setSetupIntentSecret(INTENT_SECRET_ERROR)
        );
    }, [createBillingSetupIntent, selectedTenant]);

    const methods = useMemo(
        () =>
            (data?.tenant?.billing.paymentMethods ?? []).map(mapPaymentMethod),
        [data]
    );

    // `primary` is a derived flag over a card list that selecting a primary
    // does not change, so track it locally: the star updates immediately from
    // the mutation result with no list refetch, and re-syncs whenever the
    // query data changes (tenant switch, card added, card deleted).
    const queryPrimaryId =
        data?.tenant?.billing.primaryPaymentMethod?.id ?? null;
    const [primaryId, setPrimaryId] = useState<string | null>(null);

    useEffect(() => {
        setPrimaryId(queryPrimaryId);
    }, [queryPrimaryId]);

    const setPrimary = useCallback(
        async (id: string) => {
            // Move the star immediately, remembering the current primary so we
            // can roll back if the mutation fails.
            const previousPrimaryId = primaryId;
            setPrimaryId(id);

            const result = await setBillingPaymentMethod({
                tenant: selectedTenant,
                paymentMethodId: id,
            });

            if (result.error) {
                setPrimaryId(previousPrimaryId);

                return false;
            }

            // Reconcile with the primary the server confirmed (normally `id`).
            setPrimaryId(
                result.data?.setBillingPaymentMethod.primaryPaymentMethod?.id ??
                    id
            );

            return true;
        },
        [primaryId, selectedTenant, setBillingPaymentMethod]
    );

    const deleteMethod = useCallback(
        async (id: string) => {
            const result = await deleteBillingPaymentMethod({
                tenant: selectedTenant,
                paymentMethodId: id,
            });

            if (result.error) {
                return false;
            }

            // Reload before resolving so the caller dismisses the dialog only
            // once the deleted row is gone from the list.
            await refresh();

            return true;
        },
        [deleteBillingPaymentMethod, refresh, selectedTenant]
    );

    return {
        methods,
        primaryId,
        // Only the initial load shows the table skeleton; background refetches
        // (after a delete, or urql cache revalidation) keep the current rows
        // on screen so the table never flashes empty.
        isLoading: fetching && !data,
        serverErrored: Boolean(error),
        setupIntentSecret,
        setPrimary,
        deleteMethod,
        refresh,
    };
}
