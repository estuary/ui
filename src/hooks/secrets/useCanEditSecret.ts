import { useMemo } from 'react';

import { useQuery } from 'urql';

import { graphql } from 'src/gql-types';

const SECRET_CAPABILITIES_QUERY = graphql(`
    query SecretCapabilities($prefixes: [String!]!) {
        prefixes(
            by: { minCapability: none }
            filter: { prefix: { in: $prefixes } }
        ) {
            edges {
                node {
                    prefix
                    capabilities
                }
            }
        }
    }
`);

export function useCanEditSecret(catalogName: string) {
    const prefixes = useMemo(
        () => getAncestorPrefixes(catalogName),
        [catalogName]
    );

    const [{ data, fetching, error }] = useQuery({
        query: SECRET_CAPABILITIES_QUERY,
        variables: { prefixes },
        requestPolicy: 'network-only',
        pause: prefixes.length === 0,
    });

    const canEdit =
        data?.prefixes.edges.some(({ node }) =>
            node.capabilities.includes('EditSecret')
        ) ?? false;

    return { canEdit, fetching, error };
}

// The prefixes a name sits under, e.g. `acmeCo/team/key` ->
// [`acmeCo/`, `acmeCo/team/`].
function getAncestorPrefixes(catalogName: string): string[] {
    const segments = catalogName.split('/').slice(0, -1);
    return segments.map(
        (_segment, index) => `${segments.slice(0, index + 1).join('/')}/`
    );
}
