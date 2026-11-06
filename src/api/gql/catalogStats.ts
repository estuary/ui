import { graphql } from 'src/gql-types';

export const CATALOG_STATS_QUERY = graphql(`
    query CatalogStats($by: CatalogStatsBy!) {
        catalogStats(by: $by) {
            edges {
                node {
                    catalogName
                    grain
                    timestamp
                    statsSummary {
                        readByMe {
                            docsTotal
                            bytesTotal
                        }
                        writtenByMe {
                            docsTotal
                            bytesTotal
                        }
                        readFromMe {
                            docsTotal
                            bytesTotal
                        }
                        writtenToMe {
                            docsTotal
                            bytesTotal
                        }
                    }
                }
            }
        }
    }
`);

// Separate from `CATALOG_STATS_QUERY` so the usage chart doesn't pull every
// binding's breakdown on its faster poll. Per-binding volume is `out` for a
// capture and `right` for a materialization: the fields the task's own totals
// are accumulated from, so the table adds up to the chart.
//   https://github.com/estuary/flow/blob/master/ops-catalog/catalog-stats.ts
//
// `bytesBehind` and `lastPublishedAt` feed a materialization's backlog and time
// lag.
//
// A fragment rather than a query: `useCatalogTaskStats` aliases `catalogStats`
// once per batch of names, so its query is built at runtime around this.
export const CATALOG_TASK_STATS_FRAGMENT = graphql(`
    fragment CatalogTaskStatsFields on CatalogStats {
        catalogName
        grain
        timestamp
        statsSummary {
            lastPublishedAt
        }
        taskStats {
            capture {
                collection
                lastPublishedAt
                out {
                    docsTotal
                    bytesTotal
                }
            }
            materialize {
                collection
                bytesBehind
                lastSourcePublishedAt
                right {
                    docsTotal
                    bytesTotal
                }
            }
        }
    }
`);
