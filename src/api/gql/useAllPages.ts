import type { AnyVariables, CombinedError, DocumentInput } from '@urql/core';

import { useEffect, useRef, useState } from 'react';

import { useQuery } from 'urql';

interface Connection<TNode> {
    edges: { node: TNode }[];
    pageInfo: {
        hasNextPage: boolean;
        endCursor?: string | null;
    };
}

interface UseAllPagesOptions<TData, TVariables, TNode, TResult> {
    variables?: Omit<TVariables, 'after'>;
    getConnection: (data: TData) => Connection<TNode>;
    transform: (node: TNode) => TResult;
    pause?: boolean;
}

interface UseAllPagesResult<TResult> {
    data: TResult[];
    loading: boolean;
    error: CombinedError | undefined;
}

/**
 * Fetches all pages from a Relay-style paginated query.
 */
export function useAllPages<
    TData,
    TVariables extends AnyVariables & { after?: string },
    TNode,
    TResult,
>(
    query: DocumentInput<TData, TVariables>,
    options: UseAllPagesOptions<TData, TVariables, TNode, TResult>
): UseAllPagesResult<TResult> {
    const { pause } = options;

    const variablesKey = JSON.stringify(options.variables ?? {});

    // Store callbacks in refs so they don't need to be effect dependencies.
    // Callers typically pass inline arrows (e.g. `(data) => data.liveSpecs`)
    // which are new references every render. Putting them in deps would
    // re-run the accumulation effect on every render, duplicating items
    // and triggering an infinite setState loop.
    const getConnectionRef = useRef(options.getConnection);
    const transformRef = useRef(options.transform);
    getConnectionRef.current = options.getConnection;
    transformRef.current = options.transform;

    const accumulator = useRef<{ key: string; items: TResult[] }>({
        key: '',
        items: [],
    });
    const [cursor, setCursor] = useState<string | undefined>();
    const [result, setResult] = useState<TResult[]>([]);

    // Reset when variables change
    useEffect(() => {
        accumulator.current = { key: variablesKey, items: [] };
        setCursor(undefined);
        setResult([]);
    }, [variablesKey]);

    const variables = {
        ...options.variables,
        after: cursor,
    } as TVariables;

    const [{ fetching, data, error }] = useQuery({
        query,
        variables,
        pause,
    });

    // Accumulate paginated records, then setResult when we reach the end
    useEffect(() => {
        if (fetching || !data) {
            return;
        }

        const acc = accumulator.current;

        // just in case variables change while we're fetching pages
        if (acc.key !== variablesKey) {
            return;
        }

        // When on the first page, reset the accumulator so URQL refetches
        // (TTL expiry, StrictMode double-run) don't duplicate items.
        if (!cursor) {
            acc.items = [];
        }

        const connection = getConnectionRef.current(data);

        for (const { node } of connection.edges) {
            acc.items.push(transformRef.current(node));
        }

        const { hasNextPage, endCursor } = connection.pageInfo;

        if (hasNextPage && endCursor) {
            setCursor(endCursor);
        } else {
            setResult([...acc.items]);
        }
    }, [data, fetching, variablesKey, cursor]);

    return {
        data: result,
        loading: fetching && result.length === 0,
        error,
    };
}
