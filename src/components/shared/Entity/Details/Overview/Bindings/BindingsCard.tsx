import type { DataByHourRange } from 'src/components/graphs/types';
import type { BindingRow } from 'src/components/shared/Entity/Details/Overview/Bindings/types';

import CardWrapper from 'src/components/shared/CardWrapper';
import BindingsCardHeader from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsCardHeader';
import BindingsTable from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsTable';
import BindingsToolbar from 'src/components/shared/Entity/Details/Overview/Bindings/BindingsToolbar';
import { getSearchLabelId } from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { useBindingsTableState } from 'src/components/shared/Entity/Details/Overview/Bindings/useBindingsTableState';
import Error from 'src/components/shared/Error';
import { useEntityType } from 'src/context/EntityContext';

interface Props {
    bindings: BindingRow[];
    error?: any;
    // The window the figures cover, stated by the chip beside the heading.
    range: DataByHourRange;
    // Volumes for the selected range are in flight. Names and statuses come from
    // the spec and stay accurate throughout.
    volumesLoading: boolean;
}

/**
 * The bindings card: heading, filter toolbar and table.
 *
 * Split from the data fetch so the Storybook harness renders this exact tree
 * from fixtures. A harness that rebuilt the markup itself would be free to
 * disagree with the page about card props, header or row layout — which had
 * already happened once and gave two false readings during review.
 */
function BindingsCard({ bindings, error, range, volumesLoading }: Props) {
    const entityType = useEntityType();

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
                    loading={volumesLoading}
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
                volumesLoading={volumesLoading}
            />
        </CardWrapper>
    );
}

export default BindingsCard;
