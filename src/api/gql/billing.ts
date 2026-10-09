import { graphql } from 'src/gql-types';

export const BILLING_INVOICE_PAGE_SIZE = 100;

// `lineItems` and `extra` are opaque JSON scalars in the schema, so codegen
// types them as `unknown`; the hook casts them to the InvoiceLineItem[] / extra
// shapes the rest of the billing UI already expects. `billed_prefix` is not on
// the node because the tenant is implied by the `tenant(name:)` parent.
export const TENANT_BILLING_INVOICES_QUERY = graphql(`
    query TenantBillingInvoices($tenant: String!, $first: Int, $after: String) {
        tenant(name: $tenant) {
            name
            billing {
                invoices(first: $first, after: $after) {
                    edges {
                        node {
                            dateStart
                            dateEnd
                            invoiceType
                            subtotal
                            lineItems
                            extra
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
            name
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
