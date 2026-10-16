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
