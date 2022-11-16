import SearchIcon from '@mui/icons-material/Search';
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
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import RowSelector from 'components/tables/RowActions/RowSelector';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import Title from 'components/tables/Title';
import { useZustandStore } from 'context/Zustand/provider';
import { useSelectNew } from 'hooks/supabase-swr/hooks/useSelect';
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
import DateFilter from './Filters/Date';
import { RowSelectorProps } from './RowActions/types';

interface Props {
    columns: {
        field: string | null;
        headerIntlKey: string | null;
    }[];
    query: PostgrestFilterBuilder<any>;
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
    enableTimeFiltering?: boolean;
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

const emptyRowHeight = 80;
const rowsPerPageOptions = [10, 25, 50];

// TODO (tables) I think we should switch this to React Table soon
//   Also - you MUST include a count with your query or else pagination breaks
function EntityTable({
    columns,
    noExistingDataContentIds,
    query,
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
    enableTimeFiltering,
    rowSelectorProps,
    showEntityStatus = false,
    selectableTableStoreName,
}: Props) {
    const [page, setPage] = useState(0);
    const isFiltering = useRef(false);

    const { mutate: mutateSelectData } = useSelectNew<any>(query);
    // const selectData = useSelectResponse ? useSelectResponse.data : null;

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

    // TODO (tables) THIS IS SO GROSS I AM SORRY
    // So this is super hacky but works for getting stats out quickly without
    //  overhauling TOO much right now. A follow up to this should be to get
    //  tables working off of a store to render and then we can hydrate however
    //  each table needs.
    // useEffect(() => {
    //     void (async () => {
    //         if (useSelectResponse) {
    //             let newRows = null;
    //             const rowData = useSelectResponse.data;

    //             if (addStatsToQuery) {
    //                 try {
    //                     setStatsLoaded(false);
    //                     const { data: statsData, error } = await getStatsByName(
    //                         rowData.map((rowDatum) => rowDatum.catalog_name)
    //                     );

    //                     if (error) {
    //                         console.error('Uh oh ', error);
    //                     }

    //                     if (statsData && statsData.length > 0) {
    //                         newRows = [];
    //                         console.log('statsData', statsData);
    //                         rowData.forEach((row) => {
    //                             statsData.forEach((stats) => {
    //                                 newRows.push({
    //                                     ...row,
    //                                     stats:
    //                                         stats.catalog_name ===
    //                                         row.catalog_name
    //                                             ? stats
    //                                             : undefined,
    //                                 });
    //                             });
    //                         });
    //                     }
    //                 } catch (e: unknown) {
    //                     console.error('Uh oh ', e);
    //                 }
    //             }

    //             setStatsLoaded(true);
    //             setSelectData(newRows ?? rowData);
    //         }
    //     })();
    // }, [addStatsToQuery, useSelectResponse]);

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
            mutateSelectData().catch(() => {});
        }
    }, [mutateSelectData, successfulTransformations]);

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

                    {enableTimeFiltering ? <DateFilter /> : null}

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            m: 0,
                        }}
                    >
                        <SearchIcon sx={{ mb: 0.9, mr: 0.5, fontSize: 18 }} />
                        <TextField
                            id="capture-search-box"
                            label={intl.formatMessage({
                                id: filterLabel,
                            })}
                            variant="standard"
                            onChange={handlers.filterTable}
                        />
                    </Box>
                </Toolbar>
            </Box>

            <Box sx={{ mb: 2, mx: 2 }}>
                <TableContainer component={Box}>
                    <Table
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
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Box width={450}>
                                                <Typography
                                                    variant="h6"
                                                    align="center"
                                                    sx={{ mb: 2 }}
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
