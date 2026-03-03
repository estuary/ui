import { useEffect, useRef, useState } from 'react';

import { gql, useQuery } from 'urql';

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
    query LiveSpecsQuery($prefix: String!, $after: String) {
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

    const allNames = useRef<Set<string>>(new Set());
    const [after, setAfter] = useState<string | undefined>(undefined);
    const [result, setResult] = useState<string[]>([]);

    // reset when tenant changes
    useEffect(() => {
        allNames.current = new Set();
        setAfter(undefined);
        setResult([]);
    }, [selectedTenant]);

    const [{ fetching, data }] = useQuery({
        query: LiveSpecsQuery,
        variables: { prefix: selectedTenant ?? '', after },
        pause: !selectedTenant,
    });

    useEffect(() => {
        if (fetching || !data) {
            return;
        }

        for (const edge of data.liveSpecs.edges) {
            allNames.current.add(edge.node.catalogName);
        }

        const endCursor = data.liveSpecs.pageInfo?.endCursor;
        if (data.liveSpecs.pageInfo?.hasNextPage && endCursor) {
            setAfter(endCursor);
        } else {
            setResult(Array.from(allNames.current));
        }
    }, [data, fetching]);

    return result;
}
