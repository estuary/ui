import { gql } from 'urql';

import { useAllPages } from 'src/api/gql/useAllPages';
import { useTenantStore } from 'src/stores/Tenant/Store';

interface LiveSpecsQueryResponse {
    liveSpecs: {
        edges: {
            cursor: string;
            node: {
                catalogName: string;
                liveSpec: {
                    catalogType: string;
                };
            };
        }[];
        pageInfo: {
            hasNextPage: boolean;
            endCursor: string;
        };
    };
}

const LiveSpecsQuery = gql<
    LiveSpecsQueryResponse,
    {
        prefix: string;
        after?: string;
    }
>`
    query LiveSpecsQuery($prefix: Prefix!, $after: String) {
        liveSpecs(by: { prefix: $prefix }, first: 100, after: $after) {
            edges {
                cursor
                node {
                    catalogName
                    liveSpec {
                        catalogType
                    }
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

export function useLiveSpecs() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const prefix = selectedTenant ?? '';

    const { data } = useAllPages(LiveSpecsQuery, {
        variables: { prefix },
        getConnection: (data) => data.liveSpecs,
        transform: (node) => node.catalogName,
        pause: !selectedTenant,
    });

    return data;
}
