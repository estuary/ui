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
export const CATALOG_TASK_STATS_QUERY = graphql(`
    query CatalogTaskStats($by: CatalogStatsBy!) {
        catalogStats(by: $by) {
            edges {
                node {
                    catalogName
                    grain
                    timestamp
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
                            lastSourcePublishedAt
                            right {
                                docsTotal
                                bytesTotal
                            }
                        }
                    }
                }
            }
        }
    }
`);
