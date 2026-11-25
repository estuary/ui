import type { BillingPlan, Invoice } from 'src/api/gql/billing';
import type {
    CatalogStatsBy,
    CreateBillingSetupIntentMutation,
    SetBillingContactMutation,
    SetBillingContactMutationVariables,
    TenantBillingContactQuery,
    TenantBillingPaymentMethodsQuery,
} from 'src/gql-types/graphql';

import { DateTime } from 'luxon';

import { graphql, HttpResponse, server } from 'src/test/server/test-server';
import { getGqlUrl } from 'src/utils/env-utils';

export const billingGraphql = graphql.link(getGqlUrl());

const tenantBilling = (billing: object) => ({
    tenant: {
        __typename: 'Tenant' as const,
        billing: { __typename: 'TenantBilling' as const, ...billing },
    },
});

const tier = (rateCents: number, quantity: number | null = null) => ({
    __typename: 'PricingTier' as const,
    rateCents,
    quantity,
});

const cloudPlan: BillingPlan = {
    __typename: 'SelfServePlan',
    phase: 'PAID',
    collectionMethod: 'CHARGE_DEFAULT_PAYMENT_METHOD',
    trial: {
        __typename: 'TrialPeriod',
        start: '2026-08-01',
        end: '2026-08-31',
    },
    dataTiers: [tier(50)],
    usageTiers: [tier(14, 4464), tier(7)],
};

export const internalPlan: BillingPlan = { __typename: 'InternalPlan' };

export const planData = (plan: BillingPlan = cloudPlan) =>
    tenantBilling({ plan });

export const monthToDateData = (chargesCents = 68200) =>
    tenantBilling({
        monthToDate: {
            __typename: 'BillingMonthToDate',
            chargesCents,
            projectedSubtotalCents: 201749,
            days: [],
        },
    });

// An invoice for a month of 2026, as `yyyy-MM`'s `MM`.
export const invoice = (
    month: string,
    overrides: Partial<Invoice> = {}
): Invoice => ({
    __typename: 'Invoice',
    dateStart: `2026-${month}-01`,
    dateEnd: `2026-${month}-28`,
    invoiceType: 'FINAL',
    subtotal: 141000,
    lineItems: [
        {
            description: 'Data processing (at $0.50/GB)',
            count: 2960,
            rate: 50,
            subtotal: 148000,
        },
        {
            description: `Task hours during the ${month} outage`,
            count: 1,
            rate: -7000,
            subtotal: -7000,
        },
    ],
    extra: { processed_data_gb: 2960, task_usage_hours: 6920 },
    status: 'paid',
    invoicePdf: null,
    hostedInvoiceUrl: null,
    ...overrides,
});

export const invoicesData = (
    nodes: Invoice[] = [],
    endCursor: string | null = null
) =>
    tenantBilling({
        invoices: {
            __typename: 'InvoiceConnection',
            edges: nodes.map((node) => ({ __typename: 'InvoiceEdge', node })),
            pageInfo: {
                __typename: 'PageInfo',
                hasNextPage: Boolean(endCursor),
                endCursor,
            },
        },
    });

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

export const paymentMethodsData = (value = billing()) => ({
    tenant: { __typename: 'Tenant' as const, billing: value },
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
    emails: ['billing@acme.co'],
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
    emails: [],
    address: null,
};

export const contactData = (contact: Contact) => ({
    tenant: {
        __typename: 'Tenant' as const,
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
            const { name, emails, address } = variables;
            return HttpResponse.json({
                data: {
                    setBillingContact: {
                        __typename: 'SetBillingContactPayload',
                        contact: {
                            __typename: 'BillingContact',
                            name,
                            emails: [emails].flat(),
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

const pageInfo = {
    __typename: 'PageInfo' as const,
    hasNextPage: false,
    endCursor: null,
};

// The usage tab's task list: enabled captures with these names.
export const usageSpecsData = (names: string[]) => ({
    liveSpecs: {
        __typename: 'LiveSpecRefConnection',
        edges: names.map((catalogName) => ({
            __typename: 'LiveSpecRefEdge',
            node: {
                __typename: 'LiveSpecRef',
                catalogName,
                liveSpec: {
                    __typename: 'LiveSpec',
                    catalogType: 'capture',
                    isDisabled: false,
                    readsFrom: null,
                },
            },
        })),
        pageInfo,
    },
});

// A daily bucket per name and day of each batch's window, with `gbOf(name)`
// GB read and a task running all day.
export const usageStatsData = (
    variables: Record<string, CatalogStatsBy>,
    gbOf: (name: string) => number
) =>
    Object.fromEntries(
        Object.entries(variables).map(([key, { names, start, end }]) => {
            const days: string[] = [];
            for (
                let day = DateTime.fromISO(start, { zone: 'utc' });
                day < DateTime.fromISO(end, { zone: 'utc' });
                day = day.plus({ days: 1 })
            ) {
                days.push(day.toISO() ?? '');
            }

            return [
                key.replace('vars', 'batch'),
                {
                    __typename: 'CatalogStatsConnection',
                    edges: names.flatMap((catalogName) =>
                        days.map((timestamp) => ({
                            __typename: 'CatalogStatsEdge',
                            node: {
                                __typename: 'CatalogStats',
                                catalogName,
                                timestamp,
                                statsSummary: {
                                    __typename: 'CatalogStatsSummary',
                                    readByMe: {
                                        __typename: 'DocsAndBytes',
                                        bytesTotal: String(
                                            gbOf(catalogName) * 1e9
                                        ),
                                    },
                                    writtenByMe: {
                                        __typename: 'DocsAndBytes',
                                        bytesTotal: '0',
                                    },
                                    usageSeconds: String(24 * 3600),
                                },
                            },
                        }))
                    ),
                },
            ];
        })
    );

export const noConnectorsData = {
    connectors: { __typename: 'ConnectorConnection', edges: [], pageInfo },
};
