import type { AnyVariables, CombinedError, DocumentInput } from '@urql/core';

import { useEffect, useRef, useState } from 'react';

import { createRequest, useQuery } from 'urql';

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
        request: createRequest(query, options.variables as TVariables).key,
        resetKey: options.resetKey ?? null,
    });

    // Store callbacks in refs so they don't need to be effect dependencies.
    // Callers typically pass inline arrows (e.g. `(data) => data.liveSpecs`)
    // which are new references every render. Putting them in deps would
    // re-run the accumulation effect on every render and trigger an infinite
    // setState loop.
    const getConnectionRef = useRef(options.getConnection);
    const transformRef = useRef(options.transform);
    getConnectionRef.current = options.getConnection;
    transformRef.current = options.transform;

    const accumulator = useRef<{
        key: string;
        pages: Map<string | undefined, TResult[]>;
    }>({
        key: variablesKey,
        pages: new Map(),
    });
    if (accumulator.current.key !== variablesKey) {
        accumulator.current = { key: variablesKey, pages: new Map() };
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
    const requestKey = createRequest(query, variables).key;

    const [{ fetching, data, error, operation }] = useQuery({
        query,
        variables,
        pause,
    });
    const operationKey = operation?.key;
    const responseCursor = operation?.variables.after ?? undefined;

    // Accumulate paginated records, then setResult when we reach the end
    useEffect(() => {
        // URQL can retain the previous request's data while variables change.
        if (fetching || !data || operationKey !== requestKey) {
            return;
        }

        const acc = accumulator.current;

        // just in case variables change while we're fetching pages
        if (acc.key !== variablesKey) {
            return;
        }

        const connection = getConnectionRef.current(data);
        // Map insertion order preserves traversal order when a page is replaced.
        acc.pages.set(
            responseCursor,
            connection.edges.map(({ node }) => transformRef.current(node))
        );

        const { hasNextPage, endCursor } = connection.pageInfo;

        if (hasNextPage && endCursor) {
            setCursorState({ key: variablesKey, value: endCursor });
        } else {
            setResultState({
                key: variablesKey,
                data: Array.from(acc.pages.values()).flat(),
                complete: true,
            });
        }
    }, [
        data,
        fetching,
        variablesKey,
        requestKey,
        operationKey,
        responseCursor,
    ]);

    return {
        data: result,
        loading: !pause && !error && !complete,
        error,
    };
}
