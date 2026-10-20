import { useAllPages } from 'src/api/gql/useAllPages';
import { graphql } from 'src/gql-types';

const PUBLIC_DATA_PLANES_QUERY = graphql(`
    query PublicDataPlanes($first: Int, $after: String) {
        publicDataPlanes(first: $first, after: $after) {
            edges {
                node {
                    name
                    cloudProvider
                    region
                }
            }
            pageInfo {
                ...PageInfoFields
            }
        }
    }
`);

export function usePublicDataPlanes() {
    return useAllPages(PUBLIC_DATA_PLANES_QUERY, {
        variables: { first: 100 },
        getConnection: (data) => data.publicDataPlanes,
        transform: (node) => node,
    });
}
