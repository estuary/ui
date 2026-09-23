import type { SxProps, Theme } from '@mui/material';
import type { MouseEvent } from 'react';
import type {
    BindingRow,
    BindingSortKey,
} from 'src/components/shared/Entity/Details/Overview/Bindings/types';
import type { Entity, SortDirection } from 'src/types';

import {
    Box,
    Button,
    iconButtonClasses,
    Skeleton,
    Stack,
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

import { ArrowDown, FilterListCircle, Search } from 'iconoir-react';

import { LagCell } from 'src/components/shared/Entity/Details/Overview/Bindings/LagCell';
import { LastDataCell } from 'src/components/shared/Entity/Details/Overview/Bindings/LastDataCell';
import {
    BINDINGS_PER_PAGE_OPTIONS,
    DEFAULT_BINDINGS_PER_PAGE,
} from 'src/components/shared/Entity/Details/Overview/Bindings/shared';
import { StatusCell } from 'src/components/shared/Entity/Details/Overview/Bindings/StatusCell';
import { VolumeCell } from 'src/components/shared/Entity/Details/Overview/Bindings/VolumeCell';
import EntityNameDetailsLink from 'src/components/shared/Entity/EntityNameDetailsLink';
import { formatDocs } from 'src/components/tables/cells/stats/shared';
import TablePaginationActions from 'src/components/tables/PaginationActions';
import {
    diminishedTextColor,
    doubleElevationHoverBackground,
    getTableHeaderWithoutHeaderColor,
} from 'src/context/Theme';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { BINDING_TERMS, ENTITY_SETTINGS } from 'src/settings/entity';

interface Column {
    align?: 'right';
    header: string;
    // Omitted for Status, which is unsortable on purpose — see below.
    sortKey?: BindingSortKey;
    // Pins the width so `table-layout: auto` doesn't hand this column a share
    // of the table's surplus. Left unset only on Collection and Source stream,
    // so the name columns are the ones that absorb it.
    width?: number;
}

// The columns every row shares, minus the freshness column at the end —
// captures and materializations disagree on what that should be.
const getBaseColumns = (volumeHeader: string): Column[] => [
    { header: 'Collection', sortKey: 'collection' },
    // Unsortable: the filter chips above the table already order by status, and
    // carry the counts too.
    { header: 'Status', width: 110 },
    { align: 'right', header: 'Docs', sortKey: 'docs', width: 90 },
    {
        align: 'right',
        header: volumeHeader,
        sortKey: 'bytes',
        width: 170,
    },
];

// Capture-only: a materialization answers the same question against the
// source's own frontier instead, via `LAG_COLUMNS`.
const LAST_DATA_COLUMN: Column = {
    align: 'right',
    header: 'Last data',
    sortKey: 'lastPublishedAt',
    width: 120,
};

const CAPTURE_COLUMNS: Column[] = [
    { header: 'Source stream', sortKey: 'resourcePath' },
    ...getBaseColumns('Data written'),
    LAST_DATA_COLUMN,
];

// Materialization-only: a capture has no upstream frontier to be behind, so
// `bytesBehind`/`secondsBehind` are always null there. `secondsBehind`
// replaces `LAST_DATA_COLUMN` rather than sitting beside it.
const LAG_COLUMNS: Column[] = [
    {
        align: 'right',
        header: 'Bytes behind',
        sortKey: 'bytesBehind',
        width: 130,
    },
    {
        align: 'right',
        header: 'Time behind',
        sortKey: 'secondsBehind',
        width: 130,
    },
];

const MATERIALIZATION_COLUMNS: Column[] = [
    ...getBaseColumns('Data read'),
    ...LAG_COLUMNS,
];

// MUI hides its sort arrow entirely until a column is active, which reads as
// "only this column sorts". Kept faintly visible on every sortable column.
const sortLabelSx = {
    [`& .${tableSortLabelClasses.icon}`]: {
        color: 'inherit !important',
        fontSize: 12,
        opacity: 0.4,
    },
    '&:hover': {
        [`& .${tableSortLabelClasses.icon}`]: { opacity: 0.75 },
    },
    [`&.${tableSortLabelClasses.active}`]: {
        color: 'primary.main',
        [`& .${tableSortLabelClasses.icon}`]: { opacity: 1 },
    },
};

// The global MuiTableCell override (Theme.tsx) sets horizontal padding only.
const bodyCellSx = {
    py: 1.25,
};

const firstBodyCellSx = { ...bodyCellSx, pl: 2 };
const lastBodyCellSx = { ...bodyCellSx, pr: 2 };

// Every binding on a task shares a catalog prefix and differs only in its last
// segment, which is what end-ellipsis would cut first. `direction: rtl` with
// `textAlign: left` moves the ellipsis to the start: it flips which edge the
// browser treats as the overflow end without reversing the text.
const truncateStartSx: SxProps<Theme> = {
    'direction': 'rtl',
    'display': 'block',
    'overflow': 'hidden',
    'textAlign': 'left',
    'textOverflow': 'ellipsis',
    'whiteSpace': 'nowrap',
    // `EntityNameDetailsLink`'s anchor is `display: flex`, whose main axis
    // `direction: rtl` would flip; forcing it back to a block keeps the rtl
    // trick confined to text overflow. The overflow properties aren't
    // inherited, so the anchor needs its own copy to draw the ellipsis at all.
    '& a': {
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
};

// Collection has no fixed `width`, so without a cap a long name drags the whole
// table wider instead of truncating.
const COLLECTION_CELL_MAX_WIDTH = 360;

// Aligns the outer columns with the card's own edge padding.
const getEdgeCellSx = (
    columnIndex: number,
    columnCount: number
): SxProps<Theme> => ({
    ...(columnIndex === 0 && { pl: 2 }),
    ...(columnIndex === columnCount - 1 && { pr: 2 }),
});

// MUI's default `hover` tint is near-invisible in dark mode. `cursor: pointer`
// because the whole row navigates, not just the link text.
const rowSx: SxProps<Theme> = {
    'cursor': 'pointer',
    'transition': (theme) =>
        theme.transitions.create('background-color', {
            duration: theme.transitions.duration.shortest,
        }),
    '&:hover': {
        backgroundColor: (theme) =>
            doubleElevationHoverBackground[theme.palette.mode],
    },
};

// The shared pagination actions are sized for full-page tables and crowd a
// card's bottom edge.
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
    // A separate, later-resolving request from `volumesLoading` (see
    // `useBindings`): reusing that flag renders the column as "no reading"
    // while the backlog query is still in flight.
    bytesBehindLoading: boolean;
    entityType: Entity;
    // Lets the empty state tell "your filter matched nothing" apart from "this
    // task has no bindings".
    isFiltered: boolean;
    // Resets the search query and status chip. Only reachable from the empty
    // state when `isFiltered` is true.
    onClearFilter: () => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    onSortChange: (sortKey: BindingSortKey) => void;
    page: number;
    rows: BindingRow[];
    rowsPerPage: number;
    // Chained after the bytes-behind request (see `useBindings`), so it lags
    // `bytesBehindLoading` and is tracked separately.
    secondsBehindLoading: boolean;
    sortDirection: SortDirection;
    sortKey: BindingSortKey;
    // Every binding on the task, before filtering: `rows` is empty in both the
    // "no bindings" and "filter matched none" cases.
    totalBindings: number;
    // Task total, for the share figure in each volume cell's tooltip.
    totalBytes: number;
    // Rows on the current page; `rows` is the full filtered set, needed for the count.
    visibleRows: BindingRow[];
    // Volumes for the selected range are in flight. Names and statuses come
    // from the spec and stay accurate throughout.
    volumesLoading: boolean;
    // The spec itself hasn't resolved, so every column gets a placeholder row
    // rather than flashing the "no bindings" empty state first.
    specLoading: boolean;
}

// Placeholder rows shown while the spec is still resolving.
const SKELETON_ROW_COUNT = 5;

export function BindingsTable({
    bytesBehindLoading,
    entityType,
    isFiltered,
    onClearFilter,
    onPageChange,
    onRowsPerPageChange,
    onSortChange,
    page,
    rows,
    rowsPerPage,
    secondsBehindLoading,
    sortDirection,
    sortKey,
    specLoading,
    totalBindings,
    totalBytes,
    visibleRows,
    volumesLoading,
}: Props) {
    const theme = useTheme();

    const { generatePath, navigateToPath } = useDetailsNavigator(
        ENTITY_SETTINGS.collection.routes.details
    );

    const columns = getBindingColumns(entityType);
    const isCapture = entityType !== 'materialization';

    const [, termPlural] = BINDING_TERMS[entityType];
    const tableLabel = termPlural.charAt(0).toUpperCase() + termPlural.slice(1);

    return (
        // `minWidth: 0` is load-bearing: without it the table's own `minWidth`
        // becomes this child's floor and the overflow escapes to the page
        // instead of the scroll container below.
        <Box sx={{ minWidth: 0 }}>
            <TableContainer
                component={Box}
                sx={{ maxWidth: '100%', overflowX: 'auto' }}
            >
                <Table
                    aria-label={tableLabel}
                    size="small"
                    sx={{
                        // Materialization swaps one freshness column for two
                        // lag columns rather than gaining columns outright, so
                        // both entity types land on a similar floor.
                        minWidth: isCapture ? 840 : 820,
                        // A solid surface rather than the card's translucent
                        // wash, matching other tables in the app.
                        ...getTableHeaderWithoutHeaderColor(),
                    }}
                >
                    <TableHead>
                        <TableRow>
                            {columns.map((column, columnIndex) => (
                                <TableCell
                                    key={column.header}
                                    align={column.align}
                                    sortDirection={
                                        column.sortKey === sortKey
                                            ? sortDirection
                                            : false
                                    }
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        // See `Column.width`.
                                        ...(column.width && {
                                            width: column.width,
                                        }),
                                        ...getEdgeCellSx(
                                            columnIndex,
                                            columns.length
                                        ),
                                    }}
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
                                            {column.header}
                                        </TableSortLabel>
                                    ) : (
                                        column.header
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {specLoading ? (
                            Array.from({ length: SKELETON_ROW_COUNT }).map(
                                (_, rowIndex) => (
                                    <TableRow
                                        key={`bindings-skeleton-${rowIndex}`}
                                    >
                                        {columns.map((column, columnIndex) => (
                                            <TableCell
                                                key={column.header}
                                                align={column.align}
                                                sx={{
                                                    ...bodyCellSx,
                                                    ...getEdgeCellSx(
                                                        columnIndex,
                                                        columns.length
                                                    ),
                                                }}
                                            >
                                                <Skeleton
                                                    sx={{
                                                        display: 'inline-block',
                                                    }}
                                                    width={
                                                        columnIndex === 0
                                                            ? 160
                                                            : column.align ===
                                                                'right'
                                                              ? 48
                                                              : 96
                                                    }
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            )
                        ) : visibleRows.length === 0 ? (
                            <TableRow>
                                {/* Tracks the column count, which happens to
                                    be 6 for both entity types — a capture
                                    swaps `LAST_DATA_COLUMN` for a materialization's
                                    two lag columns, one column net difference
                                    against its extra source-stream column. */}
                                <TableCell
                                    align="center"
                                    colSpan={columns.length}
                                    sx={{ py: 6, px: 2 }}
                                >
                                    <Stack
                                        alignItems="center"
                                        spacing={1}
                                        sx={{
                                            color: diminishedTextColor[
                                                theme.palette.mode
                                            ],
                                        }}
                                    >
                                        {totalBindings === 0 ? (
                                            <FilterListCircle
                                                height={28}
                                                width={28}
                                                strokeWidth={1.5}
                                            />
                                        ) : (
                                            <Search
                                                height={28}
                                                width={28}
                                                strokeWidth={1.5}
                                            />
                                        )}

                                        <Typography component="div">
                                            {totalBindings === 0
                                                ? `This task has no ${termPlural}.`
                                                : `No ${termPlural} match this filter.`}
                                        </Typography>

                                        {isFiltered ? (
                                            <Button
                                                onClick={onClearFilter}
                                                size="small"
                                                variant="text"
                                            >
                                                Clear filter
                                            </Button>
                                        ) : null}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleRows.map((row) => (
                                <TableRow
                                    key={`${row.collection}-${row.index}`}
                                    onClick={(event) => {
                                        // The collection cell's anchor already
                                        // navigates via href; firing
                                        // navigateToPath too would push a
                                        // second history entry.
                                        if (
                                            (
                                                event.target as HTMLElement
                                            ).closest('a')
                                        ) {
                                            return;
                                        }

                                        navigateToPath({
                                            catalog_name: row.collection,
                                        });
                                    }}
                                    sx={rowSx}
                                >
                                    {isCapture ? (
                                        <TableCell
                                            sx={{
                                                ...firstBodyCellSx,
                                                fontFamily: 'monospace',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {row.resourcePath}
                                        </TableCell>
                                    ) : null}

                                    <TableCell
                                        sx={{
                                            ...(isCapture
                                                ? bodyCellSx
                                                : firstBodyCellSx),
                                            maxWidth: COLLECTION_CELL_MAX_WIDTH,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {/* No tooltip: the name is truncated
                                            from the start, so the distinctive
                                            tail stays readable, and the link
                                            itself leads to the full name. */}
                                        <Box sx={truncateStartSx}>
                                            <EntityNameDetailsLink
                                                name={row.collection}
                                                path={generatePath({
                                                    catalog_name:
                                                        row.collection,
                                                })}
                                                plain
                                            />
                                        </Box>
                                    </TableCell>

                                    <StatusCell
                                        status={row.status}
                                        hasVolume={
                                            volumesLoading
                                                ? undefined
                                                : row.docs > 0 || row.bytes > 0
                                        }
                                    />

                                    <TableCell
                                        align="right"
                                        sx={{
                                            ...bodyCellSx,
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
                                        totalBytes={totalBytes}
                                    />

                                    {isCapture ? (
                                        <LastDataCell
                                            lastPublishedAt={
                                                row.lastPublishedAt
                                            }
                                            loading={volumesLoading}
                                            sx={lastBodyCellSx}
                                        />
                                    ) : (
                                        <>
                                            <LagCell
                                                kind="bytes"
                                                loading={bytesBehindLoading}
                                                value={row.bytesBehind}
                                            />

                                            <LagCell
                                                kind="seconds"
                                                loading={secondsBehindLoading}
                                                sx={lastBodyCellSx}
                                                value={row.secondsBehind}
                                            />
                                        </>
                                    )}
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
                labelRowsPerPage={`${tableLabel} per page`}
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
