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

// Row height: the global MuiTableCell override (Theme.tsx) only sets horizontal
// padding, so `size="small"` alone left rows feeling cramped edge-to-edge but not
// tall enough to click comfortably. A little vertical breathing room, plus outer
// columns nudged to align with the card's own padding, without losing density.
const bodyCellSx = {
    py: 1.25,
};

const firstBodyCellSx = { ...bodyCellSx, pl: 2 };
const lastBodyCellSx = { ...bodyCellSx, pr: 2 };

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
                        id: 'terms.bindings',
                    })}
                    size="small"
                    sx={{
                        minWidth: isCapture ? 840 : 700,
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
                                {/* Tracks the column count, which differs by
                                    entity type: 6 capture, 5 materialization. */}
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
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        <EntityNameDetailsLink
                                            name={row.collection}
                                            path={generatePath({
                                                catalog_name: row.collection,
                                            })}
                                            plain
                                        />
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

                                    <LastDataCell
                                        lastPublishedAt={row.lastPublishedAt}
                                        loading={volumesLoading}
                                        sx={lastBodyCellSx}
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
