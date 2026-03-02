import { useMemo } from 'react';

import { gql, useQuery } from 'urql';

interface BasePrefixesQueryResponse {
    prefixes: {
        edges: {
            cursor: string;
            node: {
                prefix: string;
            };
        }[];
    };
}

const BasePrefixesQuery = gql<BasePrefixesQueryResponse>`
    query BasePrefixesQuery {
        prefixes(by: { minCapability: admin }, first: 20) {
            edges {
                node {
                    prefix
                }
            }
        }
    }
`;

export function useBasePrefixes() {
    const [{ data: prefixData }] = useQuery({
        query: BasePrefixesQuery,
    });

    const basePrefixes = useMemo(() => {
        return prefixData?.prefixes.edges.map((edge) => edge.node.prefix) ?? [];
    }, [prefixData]);

    return basePrefixes;
}
