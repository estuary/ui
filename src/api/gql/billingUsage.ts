import { graphql } from 'src/gql-types';

// Every live spec under the tenant. A collection derives exactly when it reads
// from something, so `readsFrom` sorts derivations from plain collections
// without pulling each collection's model (and schema).
export const TASK_USAGE_SPECS_QUERY = graphql(`
    query TaskUsageSpecs($prefix: Prefix!, $after: String) {
        liveSpecs(by: { prefix: $prefix }, first: 500, after: $after) {
            edges {
                node {
                    catalogName
                    liveSpec {
                        catalogType
                        isDisabled
                        readsFrom(first: 1) {
                            edges {
                                cursor
                            }
                        }
                    }
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`);

// Models carry the connector image, but also every binding, so they are read
// only for the rows on screen.
export const TASK_USAGE_MODELS_QUERY = graphql(`
    query TaskUsageModels($names: [Name!]!) {
        liveSpecs(by: { names: $names }, first: 100) {
            edges {
                node {
                    catalogName
                    liveSpec {
                        model
                    }
                }
            }
        }
    }
`);

// A fragment rather than a query: `useTaskUsageStats` aliases `catalogStats`
// once per batch of names, so its query is built at runtime around this.
export const TASK_USAGE_STATS_FRAGMENT = graphql(`
    fragment TaskUsageStatsFields on CatalogStats {
        catalogName
        timestamp
        statsSummary {
            readByMe {
                bytesTotal
            }
            writtenByMe {
                bytesTotal
            }
            usageSeconds
        }
    }
`);

// The filter's dates are exclusive. No Stripe fields, which cost the server a
// Stripe call per invoice.
export const TASK_USAGE_INVOICES_QUERY = graphql(`
    query TaskUsageInvoices(
        $tenant: String!
        $filter: InvoiceFilter
        $after: String
    ) {
        tenant(name: $tenant) {
            billing {
                invoices(filter: $filter, first: 50, after: $after) {
                    edges {
                        node {
                            dateStart
                            invoiceType
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
