import type {
    CatalogStatsGrain,
    CatalogStatsQuery,
    DocsAndBytes as GqlDocsAndBytes,
} from 'src/gql-types/graphql';

import { DataGrains } from 'src/components/graphs/types';
import { graphql } from 'src/gql-types';

// maps GQL grain -> app grain
const GRAIN_MAP: Record<CatalogStatsGrain, DataGrains> = {
    HOURLY: DataGrains.hourly,
    DAILY: DataGrains.daily,
    MONTHLY: DataGrains.monthly,
};

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

type CatalogStatsGqlNode =
    CatalogStatsQuery['catalogStats']['edges'][number]['node'];

interface DocsAndBytes {
    docsTotal: bigint;
    bytesTotal: bigint;
}

const toDocsAndBytes = (dnb: GqlDocsAndBytes): DocsAndBytes => {
    return {
        docsTotal: BigInt(dnb.docsTotal),
        bytesTotal: BigInt(dnb.bytesTotal),
    };
};

export interface CatalogStats {
    catalogName: string;
    grain: DataGrains;
    timestamp: string;
    readByMe: DocsAndBytes;
    readFromMe: DocsAndBytes;
    writtenByMe: DocsAndBytes;
    writtenToMe: DocsAndBytes;
}

export const toCatalogStats = (node: CatalogStatsGqlNode): CatalogStats => {
    return {
        catalogName: node.catalogName,
        grain: GRAIN_MAP[node.grain],
        timestamp: node.timestamp,
        readByMe: toDocsAndBytes(node.statsSummary.readByMe),
        readFromMe: toDocsAndBytes(node.statsSummary.readFromMe),
        writtenByMe: toDocsAndBytes(node.statsSummary.writtenByMe),
        writtenToMe: toDocsAndBytes(node.statsSummary.writtenToMe),
    };
};
