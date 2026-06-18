import { graphql } from 'src/gql-types';

// Upper bound on invoices fetched per tenant. A tenant accrues ~12 invoices a
// year, so this comfortably covers the rolling six-month window the UI shows
// plus any older manual invoices, which the hook filters down client-side.
export const BILLING_INVOICE_FETCH_LIMIT = 100;

// `lineItems` and `extra` are opaque JSON scalars in the schema, so codegen
// types them as `unknown`; the hook casts them to the InvoiceLineItem[] / extra
// shapes the rest of the billing UI already expects. `billed_prefix` is not on
// the node because the tenant is implied by the `tenant(name:)` parent.
export const TENANT_BILLING_INVOICES_QUERY = graphql(`
    query TenantBillingInvoices($tenant: String!, $first: Int) {
        tenant(name: $tenant) {
            billing {
                invoices(first: $first) {
                    nodes {
                        dateStart
                        dateEnd
                        invoiceType
                        subtotal
                        lineItems
                        extra
                        status
                        invoicePdf
                        hostedInvoiceUrl
                        paymentDetails {
                            status
                            receiptUrl
                        }
                    }
                }
            }
        }
    }
`);

// The full payment-method set for a tenant plus which one is primary. `last4`
// is a String in the schema (zero-padded), and only one of `card` /
// `usBankAccount` is populated per method depending on `type`.
export const TENANT_BILLING_PAYMENT_METHODS_QUERY = graphql(`
    query TenantBillingPaymentMethods($tenant: String!) {
        tenant(name: $tenant) {
            billing {
                primaryPaymentMethod {
                    id
                }
                paymentMethods {
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
            }
        }
    }
`);

// Creates the Stripe SetupIntent and returns its client secret; the secret is
// handed to the Stripe Elements form, which collects and confirms the card
// directly with Stripe.
export const CREATE_BILLING_SETUP_INTENT = graphql(`
    mutation CreateBillingSetupIntent($tenant: String!) {
        createBillingSetupIntent(tenant: $tenant) {
            clientSecret
        }
    }
`);

// Promotes an existing payment method to primary. The list is re-fetched after
// this resolves, so the payload only confirms the new primary.
export const SET_BILLING_PAYMENT_METHOD = graphql(`
    mutation SetBillingPaymentMethod($tenant: String!, $paymentMethodId: String!) {
        setBillingPaymentMethod(
            tenant: $tenant
            paymentMethodId: $paymentMethodId
        ) {
            primaryPaymentMethod {
                id
            }
        }
    }
`);

// Removes a payment method. As with set-primary, the list is re-fetched after
// this resolves.
export const DELETE_BILLING_PAYMENT_METHOD = graphql(`
    mutation DeleteBillingPaymentMethod($tenant: String!, $paymentMethodId: String!) {
        deleteBillingPaymentMethod(
            tenant: $tenant
            paymentMethodId: $paymentMethodId
        ) {
            primaryPaymentMethod {
                id
            }
        }
    }
`);
