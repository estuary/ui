import type {
    BindingsFilterState,
    BindingSortKey,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';
import type { SortDirection } from 'src/types';

import { useCallback, useMemo, useState } from 'react';

import CardWrapper from 'src/components/shared/CardWrapper';
import BindingsCardHeader from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsCardHeader';
import BindingsTable from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsTable';
import BindingsToolbar from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsToolbar';
import {
    DEFAULT_BINDINGS_PER_PAGE,
    filterBindings,
    sortBindings,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import Error from 'src/components/shared/Error';
import { useEntityType } from 'src/context/EntityContext';
import useBindings from 'src/hooks/details/useBindings';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

const DEFAULT_FILTER: BindingsFilterState = { query: '', status: 'all' };

interface Props {
    entityName: string;
    latestLiveSpec: LiveSpecsQuery_details | null;
}

/**
 * The bindings of a capture or materialization, as a full-width section.
 *
 * These are the most-clicked thing on the page, and used to render as a chip
 * list inside a quarter-width rail with the remainder behind an "N more" toggle.
 */
function Bindings({ entityName, latestLiveSpec }: Props) {
    const entityType = useEntityType();

    // Read here as well as in useBindings so the heading can state the window
    // these figures cover without the table having to thread it back up.
    const range = useDetailsUsageStore((state) => state.range);

    const { bindings, counts, error, statsLoading } = useBindings(
        entityName,
        entityType,
        latestLiveSpec
    );

    const [filter, setFilter] = useState<BindingsFilterState>(DEFAULT_FILTER);
    // Volume descending: alphabetical only helps when you already know the
    // name, and then you would search for it.
    const [sortKey, setSortKey] = useState<BindingSortKey>('bytes');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_BINDINGS_PER_PAGE);

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
        () =>
            bindings.reduce(
                (accumulated, row) => ({
                    maxBytes: Math.max(accumulated.maxBytes, row.bytes),
                    totalBytes: accumulated.totalBytes + row.bytes,
                }),
                { maxBytes: 0, totalBytes: 0 }
            ),
        [bindings]
    );

    const handlers = {
        filter: useCallback(
            (
                update: (previous: BindingsFilterState) => BindingsFilterState
            ) => {
                setFilter(update);
                setPage(0);
            },
            []
        ),
        sort: useCallback(
            (nextKey: BindingSortKey) => {
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
            [sortDirection, sortKey]
        ),
        rowsPerPage: useCallback((next: number) => {
            setRowsPerPage(next);
            setPage(0);
        }, []),
    };

    return (
        <CardWrapper
            // Otherwise the card's `min-content` floor picks up the table's own
            // minWidth and the card refuses to narrow, spilling the overflow
            // onto the page rather than into the table's scroll container.
            disableMinWidth
            message={
                <BindingsCardHeader
                    count={counts.all}
                    entityType={entityType}
                    loading={statsLoading}
                    range={range}
                    totalBytes={totalBytes}
                />
            }
        >
            {error ? <Error error={error} /> : null}

            <BindingsToolbar
                counts={counts}
                filter={filter}
                searchLabelId={
                    entityType === 'materialization'
                        ? 'detailsPanel.bindings.search.materialization'
                        : 'detailsPanel.bindings.search.capture'
                }
                setFilter={handlers.filter}
            />

            <BindingsTable
                entityType={entityType}
                maxBytes={maxBytes}
                totalBytes={totalBytes}
                onPageChange={setPage}
                onRowsPerPageChange={handlers.rowsPerPage}
                onSortChange={handlers.sort}
                page={page}
                rows={sortedRows}
                rowsPerPage={rowsPerPage}
                sortDirection={sortDirection}
                sortKey={sortKey}
                totalBindings={counts.all}
                visibleRows={visibleRows}
                volumesLoading={statsLoading}
            />
        </CardWrapper>
    );
}

export default Bindings;
