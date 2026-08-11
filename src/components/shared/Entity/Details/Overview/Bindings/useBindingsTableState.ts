import type {
    BindingCounts,
    BindingRow,
    BindingsFilterState,
    BindingSortKey,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { SortDirection } from 'src/types';

import { useMemo, useState } from 'react';

import {
    countBindings,
    DEFAULT_BINDINGS_PER_PAGE,
    filterBindings,
    getVolumeTotals,
    sortBindings,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';

const DEFAULT_FILTER: BindingsFilterState = { query: '', status: 'all' };

interface BindingsTableState {
    counts: BindingCounts;
    filter: BindingsFilterState;
    handlers: {
        filter: (
            update: (previous: BindingsFilterState) => BindingsFilterState
        ) => void;
        page: (next: number) => void;
        rowsPerPage: (next: number) => void;
        sort: (nextKey: BindingSortKey) => void;
    };
    maxBytes: number;
    page: number;
    rowsPerPage: number;
    sortDirection: SortDirection;
    sortedRows: BindingRow[];
    sortKey: BindingSortKey;
    totalBytes: number;
    visibleRows: BindingRow[];
}

/**
 * Filter, sort and paging state for the bindings table.
 *
 * A hook rather than inline state because the Storybook harness needs the same
 * wiring, and a second copy of it had already drifted from this one — the
 * harness fused the filter and sort memos, so a story could not have shown the
 * behaviour the page has.
 */
export function useBindingsTableState(
    bindings: BindingRow[]
): BindingsTableState {
    const [filter, setFilter] = useState<BindingsFilterState>(DEFAULT_FILTER);
    // Volume descending: alphabetical only helps when you already know the
    // name, and then you would search for it.
    const [sortKey, setSortKey] = useState<BindingSortKey>('bytes');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_BINDINGS_PER_PAGE);

    const counts = useMemo(() => countBindings(bindings), [bindings]);

    // Split from the sort below so that changing sort does not re-filter, and
    // changing the filter does not re-walk rows the sort already ordered.
    const filteredRows = useMemo(
        () => filterBindings(bindings, filter),
        [bindings, filter]
    );

    const sortedRows = useMemo(
        () => sortBindings(filteredRows, sortKey, sortDirection),
        [filteredRows, sortDirection, sortKey]
    );

    // Only a page of rows is ever rendered, which is what keeps a task with a
    // thousand bindings from stalling the page.
    const visibleRows = useMemo(() => {
        const start = page * rowsPerPage;

        return sortedRows.slice(start, start + rowsPerPage);
    }, [page, rowsPerPage, sortedRows]);

    const { maxBytes, totalBytes } = useMemo(
        () => getVolumeTotals(bindings),
        [bindings]
    );

    const handlers = useMemo(
        () => ({
            filter: (
                update: (previous: BindingsFilterState) => BindingsFilterState
            ) => {
                setFilter(update);
                setPage(0);
            },
            page: setPage,
            rowsPerPage: (next: number) => {
                setRowsPerPage(next);
                setPage(0);
            },
            sort: (nextKey: BindingSortKey) => {
                if (nextKey === sortKey) {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                    setSortKey(nextKey);
                    // Names read best ascending; volumes descending.
                    setSortDirection(
                        nextKey === 'collection' || nextKey === 'resourcePath'
                            ? 'asc'
                            : 'desc'
                    );
                }

                setPage(0);
            },
        }),
        [sortDirection, sortKey]
    );

    return {
        counts,
        filter,
        handlers,
        maxBytes,
        page,
        rowsPerPage,
        sortDirection,
        sortedRows,
        sortKey,
        totalBytes,
        visibleRows,
    };
}
