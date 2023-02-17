import {
    Box,
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
    useMediaQuery,
    useTheme,
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
import { Pagination } from 'services/supabase';
import { SelectTableStoreNames } from 'stores/names';
import {
    SortDirection,
    TableColumns,
    TableIntlConfig,
    TableState,
    TableStatuses,
} from 'types';
import { getEmptyTableHeader, getEmptyTableMessage } from 'utils/table-utils';
import TableLoadingRows from './Loading';
import { RowSelectorProps } from './RowActions/types';

export interface ColumnProps extends TableColumns {
    renderHeader?: (
        index: number,
        storeName: SelectTableStoreNames
    ) => ReactNode;
}

interface Props {
    columns: ColumnProps[];
    renderTableRows: (data: any, showEntityStatus: boolean) => ReactNode;
    pagination: Pagination;
    setPagination: (data: any) => void;
    searchQuery: string | null;
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
    const to = (currPage ? from + size : size) - 1;

    return { from, to };
};

const getStartingPage = (val: Pagination, size: number) => {
    return val.from / size;
};

const rowsPerPageOptions = [10, 25, 50];

// TODO (tables) I think we should switch this to React Table soon
//   Also - you MUST include a count with your query or else pagination breaks
function EntityTable({
    columns,
    noExistingDataContentIds,
    renderTableRows,
    searchQuery,
    pagination,
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
    const isFiltering = useRef(Boolean(searchQuery));
    const searchTextField = useRef<HTMLInputElement>(null);

    const intl = useIntl();

    const theme = useTheme();
    const belowMd = useMediaQuery(theme.breakpoints.down('md'));

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
    const [page, setPage] = useState(0);

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

    // Weird way but works for clear out the input. This is really only needed when
    //  a user enters text into the input on a page and then clicks the left nav of
    //  the page they are already on
    useEffect(() => {
        if (searchQuery === null) {
            if (searchTextField.current) {
                searchTextField.current.value = '';
            }
        }
    }, [searchQuery]);

    useEffectOnce(() => {
        setPage(getStartingPage(pagination, rowsPerPage));

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
                setPagination(getPagination(0, rowsPerPage));
                setPage(0);
                setSearchQuery(hasQuery ? filterQuery : null);
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
                    {enableSelection ? (
                        <Title header={header} marginBottom={2} />
                    ) : null}
                </Stack>

                <Toolbar
                    disableGutters
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                    }}
                >
                    {enableSelection ? (
                        <RowSelector {...rowSelectorProps} />
                    ) : (
                        <Title header={header} />
                    )}

                    <TextField
                        inputRef={searchTextField}
                        id="capture-search-box"
                        label={intl.formatMessage({
                            id: filterLabel,
                        })}
                        variant="outlined"
                        size="small"
                        defaultValue={searchQuery}
                        onChange={handlers.filterTable}
                        sx={{
                            'width': belowMd ? 'auto' : 350,
                            '& .MuiInputBase-root': { borderRadius: 3 },
                        }}
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
                                    background:
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
                                <TableLoadingRows columns={columns} />
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
