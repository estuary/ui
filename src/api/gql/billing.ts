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
