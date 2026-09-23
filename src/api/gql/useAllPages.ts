import type { AnyVariables, CombinedError, DocumentInput } from '@urql/core';

import { useEffect, useRef, useState } from 'react';

import { useQuery } from 'urql';

export interface Connection<TNode> {
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
    resetKey?: unknown;
}

interface UseAllPagesResult<TResult> {
    data: TResult[];
    loading: boolean;
    error: CombinedError | undefined;
}

interface KeyedCursor {
    key: string;
    value?: string;
}

interface KeyedResult<TResult> {
    key: string;
    data: TResult[];
    complete: boolean;
}

const EMPTY_RESULT: never[] = [];

/**
 * Fetches all pages from a Relay-style paginated query.
 */
export function useAllPages<
    TData,
    TVariables extends AnyVariables & { after?: string | null },
    TNode,
    TResult,
>(
    query: DocumentInput<TData, TVariables>,
    options: UseAllPagesOptions<TData, TVariables, TNode, TResult>
): UseAllPagesResult<TResult> {
    const { pause } = options;

    const variablesKey = JSON.stringify({
        variables: options.variables ?? {},
        resetKey: options.resetKey ?? null,
    });

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
        key: variablesKey,
        items: [],
    });
    if (accumulator.current.key !== variablesKey) {
        accumulator.current = { key: variablesKey, items: [] };
    }

    const [cursorState, setCursorState] = useState<KeyedCursor>({
        key: variablesKey,
    });
    const cursor =
        cursorState.key === variablesKey ? cursorState.value : undefined;

    const [resultState, setResultState] = useState<KeyedResult<TResult>>({
        key: variablesKey,
        data: [],
        complete: false,
    });
    const result =
        resultState.key === variablesKey ? resultState.data : EMPTY_RESULT;
    const complete = resultState.key === variablesKey && resultState.complete;

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
            setCursorState({ key: variablesKey, value: endCursor });
        } else {
            setResultState({
                key: variablesKey,
                data: [...acc.items],
                complete: true,
            });
        }
    }, [data, fetching, variablesKey, cursor]);

    return {
        data: result,
        loading: !pause && !error && !complete,
        error,
    };
}
