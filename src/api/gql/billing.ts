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
