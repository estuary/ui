import { useAllPages } from 'src/api/gql/useAllPages';
import { graphql } from 'src/gql-types';

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

export function useLiveSpecs(tenant: string) {
    const prefix = tenant ?? '';

    const { data, loading, error } = useAllPages(LiveSpecsQuery, {
        variables: { prefix },
        getConnection: (data) => data.liveSpecs,
        transform: (node) => node.catalogName,
        pause: !prefix,
    });

    return { data, loading, error };
}
