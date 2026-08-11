import type { MouseEvent } from 'react';
import type {
    BindingRow,
    BindingSortKey,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { Entity, SortDirection } from 'src/types';

import {
    Box,
    iconButtonClasses,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    tablePaginationClasses,
    TableRow,
    TableSortLabel,
    tableSortLabelClasses,
    Typography,
    useTheme,
} from '@mui/material';

import { ArrowDown } from 'iconoir-react';
import { useIntl } from 'react-intl';

import LastDataCell from 'src/components/shared/Entity/Details/Overview/Bindings/LastDataCell';
import {
    BINDINGS_PER_PAGE_OPTIONS,
    DEFAULT_BINDINGS_PER_PAGE,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import StatusCell from 'src/components/shared/Entity/Details/Overview/Bindings/StatusCell';
import VolumeCell from 'src/components/shared/Entity/Details/Overview/Bindings/VolumeCell';
import EntityNameDetailsLink from 'src/components/shared/Entity/EntityNameDetailsLink';
import { formatDocs } from 'src/components/tables/cells/stats/shared';
import TablePaginationActions from 'src/components/tables/PaginationActions';
import { diminishedTextColor } from 'src/context/Theme';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { ENTITY_SETTINGS } from 'src/settings/entity';

interface Column {
    align?: 'right';
    headerIntlKey: string;
    // Omitted for Status, which is unsortable on purpose — see below.
    sortKey?: BindingSortKey;
}

// The two entity types differ in exactly two places, so the rest is built once:
// a capture leads with a source stream column, and the volume column is worded
// for the direction data moved.
//
// A capture's source stream is a second name column. A materialization's binding
// *is* the collection, so it has none — a Destination table column was built and
// cut, being a mechanical transform of the collection name, not navigable, and
// the widest column on the table.
const getSharedColumns = (volumeHeaderIntlKey: string): Column[] => [
    {
        headerIntlKey: 'detailsPanel.bindings.column.collection',
        sortKey: 'collection',
    },
    // Unsortable: the filter chips above the table already order by status, and
    // carry the counts too.
    { headerIntlKey: 'detailsPanel.bindings.column.status' },
    {
        align: 'right',
        headerIntlKey: 'detailsPanel.bindings.column.docs',
        sortKey: 'docs',
    },
    { align: 'right', headerIntlKey: volumeHeaderIntlKey, sortKey: 'bytes' },
    // Present for materializations too, which it was not before. The field
    // differs — a materialization stamps the newest *source* document it
    // processed rather than one it published — but the question the column
    // answers is the same, and both live in the row already fetched.
    {
        align: 'right',
        headerIntlKey: 'detailsPanel.bindings.column.lastData',
        sortKey: 'lastPublishedAt',
    },
];

const CAPTURE_COLUMNS: Column[] = [
    {
        headerIntlKey: 'detailsPanel.bindings.column.sourceStream',
        sortKey: 'resourcePath',
    },
    ...getSharedColumns('detailsPanel.bindings.column.dataWritten'),
];

const MATERIALIZATION_COLUMNS: Column[] = getSharedColumns(
    'detailsPanel.bindings.column.dataRead'
);

// MUI's default sort arrow is sized for body text and hidden entirely until a
// column is active, which reads as "only this column sorts". Scale it to the
// header text and leave it faintly visible on every sortable column so they all
// advertise themselves.
const sortLabelSx = {
    [`& .${tableSortLabelClasses.icon}`]: {
        // Sized to the header text rather than to body copy, and colour
        // inherited so the arrow reads as part of the label.
        color: 'inherit !important',
        fontSize: 12,
        opacity: 0.4,
    },
    '&:hover': {
        [`& .${tableSortLabelClasses.icon}`]: { opacity: 0.75 },
    },
    // The active column takes the link colour across both its label and its
    // arrow, so the colour reads as "this is the sort" rather than as an
    // unexplained accent on one glyph.
    [`&.${tableSortLabelClasses.active}`]: {
        color: 'primary.main',
        [`& .${tableSortLabelClasses.icon}`]: { opacity: 1 },
    },
};

// The shared pagination actions are sized for full-page tables. Inside a card
// they crowd the bottom edge, so tighten the icon buttons and keep a little
// breathing room beneath the row.
const paginationSx = {
    pt: 0.5,
    [`& .${tablePaginationClasses.toolbar}`]: {
        minHeight: 40,
        pl: 0,
    },
    [`& .${iconButtonClasses.root}`]: {
        p: 0.5,
        fontSize: 18,
    },
};

// Not exported: a non-component export from this file breaks Fast Refresh.
const getBindingColumns = (entityType: Entity) =>
    entityType === 'materialization'
        ? MATERIALIZATION_COLUMNS
        : CAPTURE_COLUMNS;

interface Props {
    entityType: Entity;
    maxBytes: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    onSortChange: (sortKey: BindingSortKey) => void;
    page: number;
    rows: BindingRow[];
    rowsPerPage: number;
    sortDirection: SortDirection;
    sortKey: BindingSortKey;
    // Every binding on the task, before filtering. Needed to tell "this task has
    // no bindings" apart from "your filter matched none of them", which `rows`
    // alone cannot distinguish because it is empty in both cases.
    totalBindings: number;
    // Task total, for the share figure in each volume cell's tooltip.
    totalBytes: number;
    // Rows on the current page; `rows` is the full filtered set, needed for the count.
    visibleRows: BindingRow[];
    // Volumes for the selected range are in flight. Names and statuses come from
    // the spec and stay accurate throughout, so only the two numeric columns go
    // to a loading state.
    volumesLoading: boolean;
}

function BindingsTable({
    entityType,
    maxBytes,
    onPageChange,
    onRowsPerPageChange,
    onSortChange,
    page,
    rows,
    rowsPerPage,
    sortDirection,
    sortKey,
    totalBindings,
    totalBytes,
    visibleRows,
    volumesLoading,
}: Props) {
    const intl = useIntl();
    const theme = useTheme();

    const { generatePath } = useDetailsNavigator(
        ENTITY_SETTINGS.collection.routes.details
    );

    const columns = getBindingColumns(entityType);
    const isCapture = entityType !== 'materialization';

    return (
        // `minWidth: 0` is load-bearing. Without it a flex or grid child adopts
        // its content's min-content width as a floor, the table's own `minWidth`
        // below becomes that floor, and the card is pushed wider than the
        // viewport — the overflow escapes to the page instead of being contained
        // by the scroll container.
        <Box sx={{ minWidth: 0 }}>
            {/* Wide tables scroll in their own container so the page itself
                never overflows horizontally. */}
            <TableContainer
                component={Box}
                sx={{ maxWidth: '100%', overflowX: 'auto' }}
            >
                <Table
                    aria-label={intl.formatMessage({
                        id: 'terms.bindings',
                    })}
                    size="small"
                    sx={{ minWidth: isCapture ? 840 : 700 }}
                >
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.headerIntlKey}
                                    align={column.align}
                                    sortDirection={
                                        column.sortKey === sortKey
                                            ? sortDirection
                                            : false
                                    }
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    {column.sortKey ? (
                                        <TableSortLabel
                                            IconComponent={ArrowDown}
                                            active={column.sortKey === sortKey}
                                            direction={
                                                column.sortKey === sortKey
                                                    ? sortDirection
                                                    : 'asc'
                                            }
                                            onClick={() => {
                                                onSortChange(
                                                    column.sortKey as BindingSortKey
                                                );
                                            }}
                                            sx={sortLabelSx}
                                        >
                                            {intl.formatMessage({
                                                id: column.headerIntlKey,
                                            })}
                                        </TableSortLabel>
                                    ) : (
                                        intl.formatMessage({
                                            id: column.headerIntlKey,
                                        })
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {visibleRows.length === 0 ? (
                            <TableRow>
                                {/* Tracks the column count, which differs by
                                    entity type: 6 capture, 5 materialization. */}
                                <TableCell
                                    align="center"
                                    colSpan={columns.length}
                                    sx={{ py: 4 }}
                                >
                                    <Typography
                                        component="div"
                                        sx={{
                                            color: diminishedTextColor[
                                                theme.palette.mode
                                            ],
                                        }}
                                    >
                                        {intl.formatMessage({
                                            id:
                                                totalBindings === 0
                                                    ? 'detailsPanel.bindings.empty'
                                                    : 'detailsPanel.bindings.noMatches',
                                        })}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleRows.map((row) => (
                                <TableRow
                                    key={`${row.collection}-${row.index}`}
                                    hover
                                >
                                    {isCapture ? (
                                        <TableCell
                                            sx={{
                                                fontFamily: 'monospace',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {row.resourcePath}
                                        </TableCell>
                                    ) : null}

                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        <EntityNameDetailsLink
                                            name={row.collection}
                                            path={generatePath({
                                                catalog_name: row.collection,
                                            })}
                                        />
                                    </TableCell>

                                    <StatusCell status={row.status} />

                                    <TableCell
                                        align="right"
                                        sx={{
                                            color:
                                                row.docs === 0 &&
                                                !volumesLoading
                                                    ? diminishedTextColor[
                                                          theme.palette.mode
                                                      ]
                                                    : undefined,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {volumesLoading ? (
                                            <Skeleton
                                                width={48}
                                                sx={{
                                                    display: 'inline-block',
                                                }}
                                            />
                                        ) : (
                                            formatDocs(row.docs)
                                        )}
                                    </TableCell>

                                    <VolumeCell
                                        bytes={row.bytes}
                                        loading={volumesLoading}
                                        maxBytes={maxBytes}
                                        totalBytes={totalBytes}
                                    />

                                    <LastDataCell
                                        lastPublishedAt={row.lastPublishedAt}
                                        loading={volumesLoading}
                                    />
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                ActionsComponent={TablePaginationActions}
                component="div"
                count={rows.length}
                labelRowsPerPage={intl.formatMessage({
                    id: 'detailsPanel.bindings.rowsPerPage',
                })}
                onPageChange={(_event: MouseEvent | null, newPage: number) => {
                    onPageChange(newPage);
                }}
                onRowsPerPageChange={(event) => {
                    onRowsPerPageChange(
                        parseInt(event.target.value, 10) ||
                            DEFAULT_BINDINGS_PER_PAGE
                    );
                }}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={BINDINGS_PER_PAGE_OPTIONS}
                sx={paginationSx}
            />
        </Box>
    );
}

export default BindingsTable;
