import type {
    CreateBillingSetupIntentMutation,
    SetBillingContactMutation,
    SetBillingContactMutationVariables,
    TenantBillingContactQuery,
    TenantBillingPaymentMethodsQuery,
} from 'src/gql-types/graphql';

import { vi } from 'vitest';

import { graphql, HttpResponse, server } from 'src/test/server/test-server';
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

type Contact = NonNullable<
    TenantBillingContactQuery['tenant']
>['billing']['contact'];

export const completeContact: Contact = {
    __typename: 'BillingContact',
    name: 'Acme Corp',
    email: 'billing@acme.co',
    address: {
        __typename: 'BillingAddress',
        line1: '500 Howard St',
        line2: null,
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
    },
};
export const incompleteContact: Contact = { ...completeContact, name: null };
export const emptyContact: Contact = {
    __typename: 'BillingContact',
    name: null,
    email: null,
    address: null,
};

export const contactData = (tenant: string, contact: Contact) => ({
    tenant: {
        __typename: 'Tenant' as const,
        name: tenant,
        billing: { __typename: 'TenantBilling' as const, contact },
    },
});

// What Stripe's AddressElement reports for a newly entered address.
export const austin = {
    complete: true,
    value: {
        name: 'Acme Texas',
        address: {
            line1: '1 Main St',
            line2: null,
            city: 'Austin',
            state: 'TX',
            postal_code: '78701',
            country: 'US',
        },
    },
};

// Echoes saved contacts back like the server does, and records each save.
export const handleContactSaves = () => {
    const saves: SetBillingContactMutationVariables[] = [];
    server.use(
        billingGraphql.mutation<
            SetBillingContactMutation,
            SetBillingContactMutationVariables
        >('SetBillingContact', ({ variables }) => {
            saves.push(variables);
            const { name, email, address } = variables;
            return HttpResponse.json({
                data: {
                    setBillingContact: {
                        __typename: 'SetBillingContactPayload',
                        contact: {
                            __typename: 'BillingContact',
                            name,
                            email,
                            address: {
                                __typename: 'BillingAddress',
                                ...address,
                            },
                        },
                    },
                },
            });
        })
    );
    return saves;
};
