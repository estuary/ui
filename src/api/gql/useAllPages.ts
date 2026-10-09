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

interface Page<TResult> {
    items: TResult[];
    // Cursor for the following page; null on the last page
    next: string | null;
}

const EMPTY_RESULT: never[] = [];
const FIRST_PAGE = '';

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

    const accumulator = useRef<{
        key: string;
        pages: Map<string, Page<TResult>>;
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

    const [{ fetching, data, error }] = useQuery({
        query,
        variables,
        pause,
    });

    // Store each page under the cursor that fetched it, then rebuild the list by
    // following the cursor chain from the first page. URQL can re-publish any
    // page (TTL expiry, graphcache invalidation, StrictMode double-run); that
    // replaces the page's entry rather than appending its items again, preventing
    // duplicates here rather than having consumers do it.
    useEffect(() => {
        if (fetching || !data) {
            return;
        }

        const acc = accumulator.current;

        // just in case variables change while we're fetching pages
        if (acc.key !== variablesKey) {
            return;
        }

        const connection = getConnectionRef.current(data);
        const { hasNextPage, endCursor } = connection.pageInfo;

        acc.pages.set(cursor ?? FIRST_PAGE, {
            items: connection.edges.map(({ node }) =>
                transformRef.current(node)
            ),
            next: hasNextPage && endCursor ? endCursor : null,
        });

        const items: TResult[] = [];
        const visited = new Set<string>();
        let pageKey: string | null = FIRST_PAGE;

        while (pageKey !== null) {
            const page = acc.pages.get(pageKey);

            // chain points at a page we haven't fetched yet, so
            // update the cursor state to fetch it
            if (!page) {
                setCursorState({ key: variablesKey, value: pageKey });
                return;
            }

            // guard against a cursor cycle
            if (visited.has(pageKey)) {
                break;
            }

            visited.add(pageKey);
            items.push(...page.items);
            pageKey = page.next;
        }

        setResultState({ key: variablesKey, data: items, complete: true });
    }, [data, fetching, variablesKey, cursor]);

    return {
        data: result,
        loading: !pause && !error && !complete,
        error,
    };
}
