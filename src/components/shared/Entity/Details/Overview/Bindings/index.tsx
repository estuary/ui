import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import CardWrapper from 'src/components/shared/CardWrapper';
import BindingsCardHeader from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsCardHeader';
import BindingsTable from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsTable';
import BindingsToolbar from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsToolbar';
import { getSearchLabelId } from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { useBindingsTableState } from 'src/components/shared/Entity/Details/Overview/Bindings/useBindingsTableState';
import Error from 'src/components/shared/Error';
import { useEntityType } from 'src/context/EntityContext';
import useBindings from 'src/hooks/details/useBindings';
import { useDetailsUsageStore } from 'src/stores/DetailsUsage/useDetailsUsageStore';

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

    const { bindings, error, statsLoading } = useBindings(
        entityName,
        entityType,
        latestLiveSpec
    );

    const {
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
    } = useBindingsTableState(bindings);

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
                searchLabelId={getSearchLabelId(entityType)}
                setFilter={handlers.filter}
            />

            <BindingsTable
                entityType={entityType}
                maxBytes={maxBytes}
                totalBytes={totalBytes}
                onPageChange={handlers.page}
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
