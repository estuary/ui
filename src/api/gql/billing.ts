import type { TenantBillingInvoicesQuery } from 'src/gql-types/graphql';
import type { TenantPaymentDetails } from 'src/types';
import type { Client } from 'urql';

import { graphql } from 'src/gql-types';

// The filter's dates are exclusive.
export const TENANT_BILLING_INVOICES_QUERY = graphql(`
    query TenantBillingInvoices(
        $tenant: String!
        $filter: InvoiceFilter
        $first: Int
        $after: String
        $withStripe: Boolean!
    ) {
        tenant(name: $tenant) {
            billing {
                invoices(filter: $filter, first: $first, after: $after) {
                    edges {
                        node {
                            dateStart
                            dateEnd
                            invoiceType
                            subtotal
                            lineItems
                            extra
                            status @include(if: $withStripe)
                            invoicePdf @include(if: $withStripe)
                            hostedInvoiceUrl @include(if: $withStripe)
                        }
                    }
                    pageInfo {
                        hasNextPage
                        endCursor
                    }
                }
            }
        }
    }
`);

export const BILLING_HISTORY_PAGE_SIZE = 4;

// Only card or usBankAccount is populated; last4 remains a zero-padded string.
graphql(`
    fragment BillingPaymentMethodFields on PaymentMethod {
        id
        type
        billingDetails {
            name
        }
        card {
            brand
            last4
            expMonth
            expYear
        }
        usBankAccount {
            bankName
            last4
        }
    }
`);

export const TENANT_BILLING_PAYMENT_METHODS_QUERY = graphql(`
    query TenantBillingPaymentMethods($tenant: String!) {
        tenant(name: $tenant) {
            billing {
                primaryPaymentMethod {
                    id
                }
                paymentMethods {
                    ...BillingPaymentMethodFields
                }
            }
        }
    }
`);

export const CREATE_BILLING_SETUP_INTENT = graphql(`
    mutation CreateBillingSetupIntent($tenant: String!) {
        createBillingSetupIntent(tenant: $tenant) {
            clientSecret
        }
    }
`);

export const SET_BILLING_PAYMENT_METHOD = graphql(`
    mutation SetBillingPaymentMethod(
        $tenant: String!
        $paymentMethodId: String!
    ) {
        setBillingPaymentMethod(
            tenant: $tenant
            paymentMethodId: $paymentMethodId
        ) {
            primaryPaymentMethod {
                id
            }
            paymentMethods {
                ...BillingPaymentMethodFields
            }
        }
    }
`);

export const DELETE_BILLING_PAYMENT_METHOD = graphql(`
    mutation DeleteBillingPaymentMethod(
        $tenant: String!
        $paymentMethodId: String!
    ) {
        deleteBillingPaymentMethod(
            tenant: $tenant
            paymentMethodId: $paymentMethodId
        ) {
            primaryPaymentMethod {
                id
            }
            paymentMethods {
                ...BillingPaymentMethodFields
            }
        }
    }
`);

export interface InvoiceLineItem {
    description: string;
    count: number;
    rate: number;
    subtotal: number;
}

export type Invoice = NonNullable<
    TenantBillingInvoicesQuery['tenant']
>['billing']['invoices']['edges'][number]['node'];

export interface MultiplePaymentMethods {
    responses: any[];
    errors: any[];
}

// Very few people are using multiple prefixes (Q4 2023) so allowing us to check 5 for now
//  is more than enough. This also prevents people in the support role from hammering the server
//  fetching payment methods for tenants they do now "own"
export const MAX_TENANTS = 5;
export const getPaymentMethodsForTenants = async (
    client: Client,
    tenants: TenantPaymentDetails[]
): Promise<MultiplePaymentMethods> => {
    // Callers pass at most MAX_TENANTS tenants.
    const responses: any[] = await Promise.all(
        tenants.map((tenantDetail) =>
            !tenantDetail.trial_start ||
            tenantDetail.payment_provider !== 'stripe' ||
            tenantDetail.gcm_account_id
                ? {
                      data: {
                          tenant: tenantDetail.tenant,
                          skipPaymentMethod: true,
                      },
                  }
                : getTenantPaymentMethods(client, tenantDetail.tenant)
        )
    );

    return {
        responses: responses.filter((r) => r.data).map((r) => r.data),
        errors: responses.filter((r) => r.error).map((r) => r.error),
    };
};

const getTenantPaymentMethods = async (client: Client, tenant: string) => {
    const { data, error } = await client
        .query(TENANT_BILLING_PAYMENT_METHODS_QUERY, { tenant })
        .toPromise();

    return error
        ? { error }
        : {
              data: {
                  tenant,
                  payment_methods: data?.tenant?.billing.paymentMethods,
              },
          };
};

// Only registers the fragment with codegen. The contact query and mutation
// share it so `setBillingContact` returns the fields its cache update writes.
graphql(`
    fragment BillingContactFields on BillingContact {
        name
        emails
        address {
            line1
            line2
            city
            state
            postalCode
            country
        }
    }
`);

export const TENANT_BILLING_CONTACT_QUERY = graphql(`
    query TenantBillingContact($tenant: String!) {
        tenant(name: $tenant) {
            billing {
                contact {
                    ...BillingContactFields
                }
            }
        }
    }
`);

export const SET_BILLING_CONTACT = graphql(`
    mutation SetBillingContact(
        $tenant: String!
        $name: String!
        $emails: [String!]!
        $address: BillingAddressInput!
    ) {
        setBillingContact(
            tenant: $tenant
            name: $name
            emails: $emails
            address: $address
        ) {
            contact {
                ...BillingContactFields
            }
        }
    }
`);

// Billing is checked against the capability bits rather than the legacy read/write/admin level, which misses ViewBilling and EditBilling granted through bundles. `none` keeps grants that carry only bits, and the `in` filter returns just the row at the tenant itself.
export const BILLING_CAPABILITIES_QUERY = graphql(`
    query BillingCapabilities($tenant: String!) {
        prefixes(
            by: { minCapability: none }
            filter: { prefix: { in: [$tenant] } }
        ) {
            edges {
                node {
                    capabilities
                }
            }
        }
    }
`);
