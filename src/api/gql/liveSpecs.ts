import { useAllPages } from 'src/api/gql/useAllPages';
import { graphql } from 'src/gql-types';
import { useTenantStore } from 'src/stores/Tenant';

const LiveSpecsQuery = graphql(`
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
`);

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
