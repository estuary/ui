import type {
    CreateBillingSetupIntentMutation,
    TenantBillingPaymentMethodsQuery,
} from 'src/gql-types/graphql';

import { vi } from 'vitest';

import { graphql, HttpResponse } from 'src/test/server/test-server';
import { getGqlUrl } from 'src/utils/env-utils';

export const billingGraphql = graphql.link(getGqlUrl());

// jsdom AbortSignals are incompatible with Node's fetch implementation.
export const dropFetchSignals = () => {
    const fetchTransport = globalThis.fetch;
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) =>
        fetchTransport(input, { ...init, signal: undefined })
    );
};

export const paymentMethod = {
    __typename: 'PaymentMethod' as const,
    id: 'pm_card',
    type: 'card',
    billingDetails: {
        __typename: 'PaymentMethodBillingDetails' as const,
        name: 'Acme card',
    },
    card: {
        __typename: 'CardPaymentMethodDetails' as const,
        brand: 'visa',
        last4: '0042',
        expMonth: 12,
        expYear: 2030,
    },
    usBankAccount: null,
};

export const billing = (
    methods = [paymentMethod],
    primaryId: string | null = null
) =>
    ({
        __typename: 'TenantBilling' as const,
        paymentMethods: methods,
        primaryPaymentMethod: primaryId
            ? { __typename: 'PaymentMethod' as const, id: primaryId }
            : null,
    }) satisfies NonNullable<
        TenantBillingPaymentMethodsQuery['tenant']
    >['billing'];

export const paymentMethodsData = (name: string, value = billing()) => ({
    tenant: { __typename: 'Tenant' as const, name, billing: value },
});

export const setupIntent = (clientSecret = 'secret') =>
    HttpResponse.json<{ data: CreateBillingSetupIntentMutation }>({
        data: {
            createBillingSetupIntent: {
                __typename: 'CreateBillingSetupIntentPayload',
                clientSecret,
            },
        },
    });
