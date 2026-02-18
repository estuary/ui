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

const LiveSpecsQuery = gql<
    LiveSpecsQueryResponse,
    {
        prefix: string;
    }
>`
    query LiveSpecsQuery($prefix: String!) {
        liveSpecs(by: { prefix: $prefix }, first: 100) {
            edges {
                cursor
                node {
                    catalogName
                    liveSpec {
                        catalogType
                    }
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

export function useLiveSpecs() {
    const basePrefixes = useBasePrefixes();

    const [{ data: liveSpecData }] = useQuery({
        query: LiveSpecsQuery,
        variables: { prefix: basePrefixes[0] },
        pause: basePrefixes.length === 0,
    });

    return useMemo(() => {
        return (
            liveSpecData?.liveSpecs.edges.map(
                (edge) => edge.node.catalogName
            ) ?? []
        );
    }, [liveSpecData]);
}
