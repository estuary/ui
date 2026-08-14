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
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';

import { ArrowDown, FilterListCircle, Search } from 'iconoir-react';
import { useIntl } from 'react-intl';

import LagCell from 'src/components/shared/Entity/Details/Overview/Bindings/LagCell';
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
import {
    diminishedTextColor,
    doubleElevationHoverBackground,
    getTableHeaderWithoutHeaderColor,
} from 'src/context/Theme';
import useDetailsNavigator from 'src/hooks/useDetailsNavigator';
import { ENTITY_SETTINGS } from 'src/settings/entity';

interface Column {
    align?: 'right';
    headerIntlKey: string;
    // Omitted for Status, which is unsortable on purpose — see below.
    sortKey?: BindingSortKey;
    // Pins this column's width so `table-layout: auto` doesn't hand it a share
    // of the table's leftover width. Every column with fixed-shape content
    // (a badge, a number, a formatted byte/time figure) sets this; the two
    // that carry a real name (Collection, Source stream) leave it unset, so
    // they're the ones that absorb the table's surplus width when the card is
    // wider than the columns strictly need — which is where surplus width
    // belongs, since a name is the one thing on the row worth the room.
    // Without this, the browser had been handing most of that surplus to
    // whichever numeric columns happened to have the longest header text
    // ("Bytes behind", "Time behind"), leaving Docs squeezed tight and the
    // others mostly empty space around a right-aligned figure.
    width?: number;
}

// The columns every row shares regardless of entity type, minus the freshness
// column at the end — captures and materializations disagree on what that
// should be (see below), so it isn't part of the shared set.
const getBaseColumns = (volumeHeaderIntlKey: string): Column[] => [
    {
        headerIntlKey: 'detailsPanel.bindings.column.collection',
        sortKey: 'collection',
    },
    // Unsortable: the filter chips above the table already order by status, and
    // carry the counts too.
    {
        headerIntlKey: 'detailsPanel.bindings.column.status',
        width: 110,
    },
    {
        align: 'right',
        headerIntlKey: 'detailsPanel.bindings.column.docs',
        sortKey: 'docs',
        width: 90,
    },
    {
        align: 'right',
        headerIntlKey: volumeHeaderIntlKey,
        sortKey: 'bytes',
        width: 170,
    },
];

// Capture-only. A materialization's freshness answer is `secondsBehind`
// instead (see `LAG_COLUMNS`) — it says the same thing this column would
// (how current is this binding) but against the source's own frontier rather
// than against nothing, which is strictly the more useful of the two
// wherever it's available. A capture has no such frontier, so this is all it
// gets.
const LAST_DATA_COLUMN: Column = {
    align: 'right',
    headerIntlKey: 'detailsPanel.bindings.column.lastData',
    sortKey: 'lastPublishedAt',
    width: 120,
};

const CAPTURE_COLUMNS: Column[] = [
    {
        headerIntlKey: 'detailsPanel.bindings.column.sourceStream',
        sortKey: 'resourcePath',
    },
    ...getBaseColumns('detailsPanel.bindings.column.dataWritten'),
    LAST_DATA_COLUMN,
];

// Materialization-only: a capture has no upstream frontier to be behind, so
// `BindingRow.bytesBehind`/`secondsBehind` are always null there and the
// column would be dead weight on every capture row. `secondsBehind` replaces
// `LAST_DATA_COLUMN` rather than sitting beside it — once a source-relative
// answer exists, the source-blind one it was standing in for stops earning
// its column.
const LAG_COLUMNS: Column[] = [
    {
        align: 'right',
        headerIntlKey: 'detailsPanel.bindings.column.bytesBehind',
        sortKey: 'bytesBehind',
        width: 130,
    },
    {
        align: 'right',
        headerIntlKey: 'detailsPanel.bindings.column.secondsBehind',
        sortKey: 'secondsBehind',
        width: 130,
    },
];

const MATERIALIZATION_COLUMNS: Column[] = [
    ...getBaseColumns('detailsPanel.bindings.column.dataRead'),
    ...LAG_COLUMNS,
];

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

// Row height: the global MuiTableCell override (Theme.tsx) only sets horizontal
// padding, so `size="small"` alone left rows feeling cramped edge-to-edge but not
// tall enough to click comfortably. A little vertical breathing room, plus outer
// columns nudged to align with the card's own padding, without losing density.
const bodyCellSx = {
    py: 1.25,
};

const firstBodyCellSx = { ...bodyCellSx, pl: 2 };
const lastBodyCellSx = { ...bodyCellSx, pr: 2 };

// Rows here commonly share a long tenant/prefix (every binding on a task
// lives under the same catalog path) and differ only in their last segment —
// exactly the part end-ellipsis would cut first. `direction: rtl` paired with
// `textAlign: left` is the standard CSS-only trick for anchoring the ellipsis
// to the *start* of the string instead: it doesn't reverse the text (there's
// no strong-RTL content in a catalog name), it only flips which edge the
// browser treats as "the end" for overflow purposes, so the visible tail
// survives and the cut lands on the shared prefix nobody was reading anyway.
const truncateStartSx: SxProps<Theme> = {
    direction: 'rtl',
    display: 'block',
    overflow: 'hidden',
    textAlign: 'left',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    // `EntityNameDetailsLink`'s anchor renders as `display: flex` internally
    // (MUI's Link-on-Typography default). Left alone, `direction: rtl` above
    // flips a flex container's main axis, not just its text alignment — that
    // wins over `textAlign: left` and shoves short, non-overflowing names
    // flush against the right edge instead of leaving them flush left. Forcing
    // the anchor back to a plain block sidesteps flex layout entirely, so the
    // rtl trick only ever touches how the actual text overflows.
    //
    // `overflow`/`text-overflow`/`white-space` aren't inherited properties, so
    // setting them only on this wrapping Box clips the anchor's text at the
    // Box's edge (the anchor is a nested block, a separate box) without ever
    // drawing the "…" — the ellipsis glyph is only inserted by the element
    // that owns the overflowing line box, which is the anchor itself. They
    // have to be repeated here for the ellipsis to actually render, not just
    // the clipping.
    '& a': {
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
};

// A cap on the Collection column specifically: it's the one column with no
// fixed `width` (see `Column.width`), so it's also the one that would
// otherwise absorb an unreasonably long name's entire footprint and drag the
// whole table wider rather than truncating.
const COLLECTION_CELL_MAX_WIDTH = 360;

// The first and last columns nudge their padding to align with the card's
// own edge padding, everywhere a row of cells gets built from `columns` — the
// header, the loading skeleton, and real body rows alike.
const getEdgeCellSx = (
    columnIndex: number,
    columnCount: number
): SxProps<Theme> => ({
    ...(columnIndex === 0 && { pl: 2 }),
    ...(columnIndex === columnCount - 1 && { pr: 2 }),
});

// MUI's default `hover` prop uses `action.hover`, a near-invisible tint in dark
// mode. Swap in the same neutral hover surface used by DataGrid list views
// (`doubleElevationHoverBackground`) so a row's hover state actually reads, and
// give it a quick transition instead of the default instant snap.
//
// The row carries `cursor: pointer` because the *entire* row navigates (see
// the TableRow's onClick below) — matching Vercel's dashboard, where any
// click on a table row opens it, not just a click precisely on the link text.
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
    // The bytes-behind column's own loading state — a separate, later-resolving
    // request from `volumesLoading` (see `useBindings`), so it is not correct
    // to reuse that flag here: doing so was the exact bug this prop exists to
    // fix, where the column read as "no reading" instead of loading whenever
    // the backlog query was still in flight after the primary stats resolved.
    bytesBehindLoading: boolean;
    entityType: Entity;
    // Whether the toolbar's search or status chip is narrowing the set, so the
    // empty state can tell "your filter matched nothing" apart from "this task
    // truly has no bindings" and offer a way out of the former.
    isFiltered: boolean;
    maxBytes: number;
    // Resets the search query and status chip. Only reachable from the empty
    // state when `isFiltered` is true.
    onClearFilter: () => void;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    onSortChange: (sortKey: BindingSortKey) => void;
    page: number;
    rows: BindingRow[];
    rowsPerPage: number;
    // The seconds-behind column's own loading state — chained after the
    // bytes-behind request (see `useBindings`/`useMaterializationBacklog`), so
    // it lags `bytesBehindLoading` and must be tracked separately rather than
    // sharing one flag between the two lag columns.
    secondsBehindLoading: boolean;
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
    // The spec itself hasn't resolved yet, so even names and statuses are
    // unknown — every column gets a placeholder row rather than rendering the
    // "no bindings" empty state, which would otherwise flash before the real
    // rows (or the real empty state) arrives.
    specLoading: boolean;
}

// Placeholder rows shown while the spec is still resolving. A fixed count
// reads as "still loading" rather than committing to a real row count before
// one is known.
const SKELETON_ROW_COUNT = 5;

function BindingsTable({
    bytesBehindLoading,
    entityType,
    isFiltered,
    maxBytes,
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
    const intl = useIntl();
    const theme = useTheme();

    const { generatePath, navigateToPath } = useDetailsNavigator(
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
                        id: 'terms.collections',
                    })}
                    size="small"
                    sx={{
                        // Materialization swaps its one freshness column for
                        // two lag columns (`LAST_DATA_COLUMN` vs
                        // `LAG_COLUMNS`) rather than gaining columns outright,
                        // so the two floors land close together despite
                        // materialization dropping the wide monospace source
                        // stream column captures carry.
                        minWidth: isCapture ? 840 : 820,
                        // Gives the header its own solid surface instead of
                        // letting the card's translucent wash show through —
                        // the same treatment other tables in the app use so
                        // the header reads as a fixed baseline rather than
                        // fading into the background, which matters more in
                        // dark mode where the wash alone reads flat.
                        ...getTableHeaderWithoutHeaderColor(),
                    }}
                >
                    <TableHead>
                        <TableRow>
                            {columns.map((column, columnIndex) => (
                                <TableCell
                                    key={column.headerIntlKey}
                                    align={column.align}
                                    sortDirection={
                                        column.sortKey === sortKey
                                            ? sortDirection
                                            : false
                                    }
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        // Pins this column's rendered width —
                                        // see `Column.width` for why the name
                                        // columns are the only ones left out.
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
                        {specLoading ? (
                            Array.from({ length: SKELETON_ROW_COUNT }).map(
                                (_, rowIndex) => (
                                    <TableRow
                                        key={`bindings-skeleton-${rowIndex}`}
                                    >
                                        {columns.map((column, columnIndex) => (
                                            <TableCell
                                                key={column.headerIntlKey}
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
                                            {intl.formatMessage({
                                                id:
                                                    totalBindings === 0
                                                        ? 'detailsPanel.bindings.empty'
                                                        : 'detailsPanel.bindings.noMatches',
                                            })}
                                        </Typography>

                                        {isFiltered ? (
                                            <Button
                                                onClick={onClearFilter}
                                                size="small"
                                                variant="text"
                                            >
                                                {intl.formatMessage({
                                                    id: 'detailsPanel.bindings.clearFilter',
                                                })}
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
                                        // The collection-name cell renders a
                                        // real anchor (EntityNameDetailsLink),
                                        // which already navigates on its own
                                        // via href. Let that native/router
                                        // navigation happen instead of also
                                        // firing navigateToPath here, which
                                        // would push a second, redundant
                                        // history entry to the same
                                        // destination.
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
                                        <Tooltip
                                            placement="bottom"
                                            title={row.collection}
                                        >
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
                                        </Tooltip>
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
                                        maxBytes={maxBytes}
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
