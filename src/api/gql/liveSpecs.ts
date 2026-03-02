import { useMemo } from 'react';

import { gql, useQuery } from 'urql';

import { useBasePrefixes } from 'src/api/gql/prefixes';

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
