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
    const prefix = selectedTenant ?? '';

    const accumulator = useRef<{ tenant: string; names: Set<string> }>({
        tenant: '',
        names: new Set(),
    });
    const [cursor, setCursor] = useState<string | undefined>();
    const [result, setResult] = useState<string[]>([]);

    // Reset when tenant changes
    useEffect(() => {
        accumulator.current = { tenant: prefix, names: new Set() };
        setCursor(undefined);
        setResult([]);
    }, [prefix]);

    const [{ fetching, data }] = useQuery({
        query: LiveSpecsQuery,
        variables: { prefix, after: cursor },
        pause: !selectedTenant,
    });

    // Accumulate paginated specs, then setResult when we reach the end
    useEffect(() => {
        if (fetching || !data) {
            return;
        }

        const acc = accumulator.current;

        // just in case tenant changes while we're fetching pages
        if (acc.tenant !== prefix) {
            return;
        }

        for (const { node } of data.liveSpecs.edges) {
            acc.names.add(node.catalogName);
        }

        const { hasNextPage, endCursor } = data.liveSpecs.pageInfo;

        if (hasNextPage && endCursor) {
            setCursor(endCursor);
        } else {
            setResult([...acc.names]);
        }
    }, [data, fetching, prefix]);

    return result;
}
