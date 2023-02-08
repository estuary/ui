import {
    Box,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material';
import TablePaginationActions from 'components/tables/PaginationActions';
import RowSelector from 'components/tables/RowActions/RowSelector';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import Title from 'components/tables/Title';
import { useZustandStore } from 'context/Zustand/provider';
import { ArrowDown } from 'iconoir-react';
import { debounce } from 'lodash';
import {
    ChangeEvent,
    MouseEvent,
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useEffectOnce } from 'react-use';
import { SelectTableStoreNames } from 'stores/names';
import {
    SortDirection,
    TableIntlConfig,
    TableState,
    TableStatuses,
} from 'types';
import { getEmptyTableHeader, getEmptyTableMessage } from 'utils/table-utils';
import { RowSelectorProps } from './RowActions/types';

export interface ColumnProps {
    field: string | null;
    headerIntlKey?: string | null;
    renderHeader?: (
        index: number,
        storeName: SelectTableStoreNames
    ) => ReactNode;
}

interface Props {
    columns: ColumnProps[];
    renderTableRows: (data: any, showEntityStatus: boolean) => ReactNode;
    setPagination: (data: any) => void;
    setSearchQuery: (data: any) => void;
    sortDirection: SortDirection;
    setSortDirection: (data: any) => void;
    columnToSort: string;
    setColumnToSort: (data: any) => void;
    header: string;
    filterLabel: string;
    enableSelection?: boolean;
    rowSelectorProps?: RowSelectorProps;
    noExistingDataContentIds: TableIntlConfig;
    showEntityStatus?: boolean;
    selectableTableStoreName: SelectTableStoreNames;
}

export const getPagination = (currPage: number, size: number) => {
    const limit = size;
    const from = currPage ? currPage * limit : 0;
    const to = currPage ? from + size : size - 1;

    return { from, to };
};

const emptyRowHeight = 45;
const rowsPerPageOptions = [10, 25, 50];

// TODO (tables) I think we should switch this to React Table soon
//   Also - you MUST include a count with your query or else pagination breaks
function EntityTable({
    columns,
    noExistingDataContentIds,
    renderTableRows,
    setPagination,
    setSearchQuery,
    sortDirection,
    setSortDirection,
    columnToSort,
    setColumnToSort,
    header,
    filterLabel,
    enableSelection,
    rowSelectorProps,
    showEntityStatus = false,
    selectableTableStoreName,
}: Props) {
    const [page, setPage] = useState(0);
    const isFiltering = useRef(false);

    const intl = useIntl();

    const isValidating = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['loading']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.loading);

    const selectData = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['response']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.response);

    const selectDataCount = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['count']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.count);

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.hydrate);

    const setRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setRows']
    >(selectableTableStoreName, selectableTableStoreSelectors.rows.set);

    const resetRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['removeRows']
    >(selectableTableStoreName, selectableTableStoreSelectors.rows.reset);

    const setAll = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectableTableStoreName, selectableTableStoreSelectors.selected.setAll);

    const successfulTransformations = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['successfulTransformations']
    >(
        selectableTableStoreName,
        selectableTableStoreSelectors.successfulTransformations.get
    );

    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    useEffect(() => {
        if (selectData && selectData.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
            enableSelection ? setRows(selectData) : null;
        } else if (isFiltering.current) {
            setTableState({ status: TableStatuses.UNMATCHED_FILTER });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [selectData, setRows, enableSelection]);

    useEffect(() => {
        if (successfulTransformations > 0) {
            hydrate();
        }
    }, [hydrate, successfulTransformations]);

    const resetSelection = () => {
        if (enableSelection) {
            setAll(false);

            resetRows();
        }
    };

    useEffectOnce(() => {
        return () => {
            return resetSelection();
        };
    });

    const handlers = {
        filterTable: debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;
                const hasQuery = Boolean(filterQuery && filterQuery.length > 0);

                isFiltering.current = hasQuery;

                resetSelection();
                setSearchQuery(hasQuery ? filterQuery : null);
                setPagination(getPagination(0, rowsPerPage));
                setPage(0);
            },
            750
        ),
        sortRequest: (_event: React.MouseEvent<unknown>, column: any) => {
            const isAsc = columnToSort === column && sortDirection === 'asc';

            resetSelection();
            setSortDirection(isAsc ? 'desc' : 'asc');
            setColumnToSort(column);
        },
        sort: (column: any) => (event: React.MouseEvent<unknown>) => {
            handlers.sortRequest(event, column);
        },
        changePage: (
            _event: MouseEvent<HTMLButtonElement> | null,
            newPage: number
        ) => {
            resetSelection();
            setPagination(getPagination(newPage, rowsPerPage));
            setPage(newPage);
        },
        changeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => {
            const newLimit = parseInt(event.target.value, 10);

            resetSelection();
            setRowsPerPage(newLimit);
            setPagination(getPagination(0, newLimit));
            setPage(0);
        },
    };

    const loadingRows = useMemo(() => {
        const styling = { height: emptyRowHeight };
        const loadingRow = columns.map((column, index) => {
            return (
                <TableCell key={`loading-${column.field}-${index}`}>
                    <Skeleton variant="rectangular" />
                </TableCell>
            );
        });

        return (
            <>
                <TableRow sx={styling}>{loadingRow}</TableRow>

                <TableRow sx={{ ...styling, opacity: '75%' }}>
                    {loadingRow}
                </TableRow>

                <TableRow sx={{ ...styling, opacity: '50%' }}>
                    {loadingRow}
                </TableRow>

                <TableRow
                    sx={{
                        ...styling,
                        'opacity': '25%',
                        '& .MuiTableCell-root': {
                            borderBottom: 'transparent',
                        },
                    }}
                >
                    {loadingRow}
                </TableRow>
            </>
        );
    }, [columns]);

    const dataRows = useMemo(
        () =>
            selectData && selectData.length > 0
                ? renderTableRows(selectData, showEntityStatus)
                : null,
        [renderTableRows, selectData, showEntityStatus]
    );

    return (
        <Box data-public>
            <Box sx={{ mx: 2 }}>
                <Stack direction="row" spacing={1}>
                    {enableSelection ? <Title header={header} /> : null}
                </Stack>

                <Toolbar
                    disableGutters
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                    }}
                >
                    {enableSelection ? (
                        <RowSelector {...rowSelectorProps} />
                    ) : (
                        <Title header={header} />
                    )}

                    <TextField
                        id="capture-search-box"
                        label={intl.formatMessage({
                            id: filterLabel,
                        })}
                        variant="outlined"
                        size="small"
                        onChange={handlers.filterTable}
                        sx={{ '& .MuiInputBase-root': { borderRadius: 3 } }}
                    />
                </Toolbar>
            </Box>

            <Box sx={{ mb: 2, mx: 2 }}>
                <TableContainer component={Box}>
                    <Table
                        size="small"
                        sx={{ minWidth: 350 }}
                        aria-label={intl.formatMessage({
                            id: 'entityTable.title',
                        })}
                    >
                        <TableHead>
                            <TableRow
                                sx={{
                                    background: (theme) =>
                                        theme.palette.background.default,
                                }}
                            >
                                {columns.map((column, index) => {
                                    if (column.renderHeader) {
                                        return column.renderHeader(
                                            index,
                                            selectableTableStoreName
                                        );
                                    }

                                    return (
                                        <TableCell
                                            key={`${column.field}-${index}`}
                                            sortDirection={
                                                columnToSort === column.field
                                                    ? sortDirection
                                                    : false
                                            }
                                        >
                                            {selectData && column.field ? (
                                                <TableSortLabel
                                                    IconComponent={ArrowDown}
                                                    active={
                                                        columnToSort ===
                                                        column.field
                                                    }
                                                    direction={
                                                        columnToSort ===
                                                        column.field
                                                            ? sortDirection
                                                            : 'asc'
                                                    }
                                                    onClick={handlers.sort(
                                                        column.field
                                                    )}
                                                    sx={{
                                                        '& .MuiTableSortLabel-icon':
                                                            {
                                                                fontSize: 14,
                                                            },
                                                    }}
                                                >
                                                    {column.headerIntlKey ? (
                                                        <FormattedMessage
                                                            id={
                                                                column.headerIntlKey
                                                            }
                                                        />
                                                    ) : null}
                                                </TableSortLabel>
                                            ) : column.headerIntlKey ? (
                                                <FormattedMessage
                                                    id={column.headerIntlKey}
                                                />
                                            ) : null}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {dataRows ? (
                                dataRows
                            ) : isValidating ||
                              tableState.status === TableStatuses.LOADING ? (
                                loadingRows
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Box width={450}>
                                                <Typography
                                                    variant="subtitle2"
                                                    align="center"
                                                    sx={{ mb: 1 }}
                                                >
                                                    <FormattedMessage
                                                        id={getEmptyTableHeader(
                                                            tableState.status,
                                                            noExistingDataContentIds
                                                        )}
                                                    />
                                                </Typography>

                                                <Typography component="div">
                                                    {getEmptyTableMessage(
                                                        tableState.status,
                                                        noExistingDataContentIds
                                                    )}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                        {dataRows && selectDataCount ? (
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        ActionsComponent={
                                            TablePaginationActions
                                        }
                                        rowsPerPageOptions={rowsPerPageOptions}
                                        count={selectDataCount}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handlers.changePage}
                                        onRowsPerPageChange={
                                            handlers.changeRowsPerPage
                                        }
                                    />
                                </TableRow>
                            </TableFooter>
                        ) : null}
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default EntityTable;
