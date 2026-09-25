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
