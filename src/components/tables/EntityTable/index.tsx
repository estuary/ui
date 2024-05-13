import {
    Box,
    Stack,
    Table,
    TableContainer,
    TextField,
    Toolbar,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import Title from 'components/tables/Title';
import { useZustandStore } from 'context/Zustand/provider';
import { debounce } from 'lodash';
import {
    ChangeEvent,
    MouseEvent,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useIntl } from 'react-intl';
import { useEffectOnce } from 'react-use';
import { Pagination } from 'services/supabase';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { SelectTableStoreNames } from 'stores/names';
import {
    SortDirection,
    TableColumns,
    TableIntlConfig,
    TableState,
    TableStatuses,
} from 'types';
import { getPagination, getStartingPage } from 'utils/table-utils';
import EntityTableBody from './TableBody';
import EntityTableFooter from './TableFooter';
import EntityTableHeader from './TableHeader';

export interface ColumnProps extends TableColumns {
    renderHeader?: (
        index: number,
        storeName: SelectTableStoreNames
    ) => ReactNode;
}

interface Props {
    columns: ColumnProps[];
    columnToSort: string;
    filterLabel: string;
    header: string | ReactNode | null;
    noExistingDataContentIds: TableIntlConfig;
    pagination: Pagination;
    renderTableRows: (data: any, showEntityStatus: boolean) => ReactNode;
    rowsPerPage: number;
    searchQuery: string | null;
    selectableTableStoreName: SelectTableStoreNames;
    setColumnToSort: (data: any) => void;
    setPagination: (data: any) => void;
    setRowsPerPage: (data: any) => void;
    setSearchQuery: (data: any) => void;
    setSortDirection: (data: any) => void;
    sortDirection: SortDirection;
    hideFilter?: boolean;
    hideHeaderAndFooter?: boolean;
    keepSelectionOnFilterOrSearch?: boolean;
    keepSelectionOnPagination?: boolean;
    minWidth?: number;
    rowsPerPageOptions?: number[];
    showEntityStatus?: boolean;
    showToolbar?: boolean;
    toolbar?: ReactNode;
    ExportComponent?: any;
}

// TODO (tables) I think we should switch this to React Table soon
//   Also - you MUST include a count with your query or else pagination breaks
function EntityTable({
    columns,
    noExistingDataContentIds,
    renderTableRows,
    searchQuery,
    pagination,
    setPagination,
    setRowsPerPage,
    setSearchQuery,
    sortDirection,
    setSortDirection,
    columnToSort,
    setColumnToSort,
    header,
    filterLabel,
    showEntityStatus = false,
    selectableTableStoreName,
    hideFilter,
    hideHeaderAndFooter,
    rowsPerPage,
    rowsPerPageOptions = [10, 25, 50, 100],
    minWidth = 350,
    showToolbar,
    toolbar,
    keepSelectionOnFilterOrSearch,
    keepSelectionOnPagination,
    ExportComponent,
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

    const networkFailed = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['networkFailed']
    >(
        selectableTableStoreName,
        selectableTableStoreSelectors.query.networkFailed
    );

    const selectData = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['query']['response']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.response);

    const hydrate = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrate']
    >(selectableTableStoreName, selectableTableStoreSelectors.query.hydrate);

    const hydrated = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['hydrated']
    >(selectableTableStoreName, selectableTableStoreSelectors.hydrated.get);

    const setHydrated = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setHydrated']
    >(selectableTableStoreName, selectableTableStoreSelectors.hydrated.set);

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

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });
    const [page, setPage] = useState(0);

    useEffect(() => {
        if (hydrated) {
            if (selectData && selectData.length > 0) {
                setTableState({ status: TableStatuses.DATA_FETCHED });
                toolbar ? setRows(selectData) : null;
            } else if (isFiltering.current) {
                setTableState({ status: TableStatuses.UNMATCHED_FILTER });
            } else if (networkFailed) {
                setTableState({ status: TableStatuses.NETWORK_FAILED });
            } else {
                setTableState({ status: TableStatuses.NO_EXISTING_DATA });
            }
        }
    }, [hydrated, networkFailed, selectData, setRows, toolbar]);

    useEffect(() => {
        if (successfulTransformations > 0) {
            hydrate();
        }
    }, [hydrate, successfulTransformations]);

    const resetSelection = useCallback(() => {
        if (toolbar) {
            setAll(false);
            resetRows();
        }
    }, [resetRows, setAll, toolbar]);

    // TODO (tables | optimization): Evaluate whether the hacky fix below is needed and remove if not.
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

    const selectionResetHandler = useCallback(
        (override?: boolean) => {
            if (override ?? !keepSelectionOnFilterOrSearch) {
                resetSelection();
            }

            setHydrated(false);
        },
        [keepSelectionOnFilterOrSearch, resetSelection, setHydrated]
    );

    const handlers = {
        filterTable: debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;
                const hasQuery = Boolean(filterQuery && filterQuery.length > 0);

                isFiltering.current = hasQuery;

                selectionResetHandler();
                setPagination(getPagination(0, rowsPerPage));
                setPage(0);
                setSearchQuery(hasQuery ? filterQuery : null);
            },
            750
        ),
        sortRequest: (_event: React.MouseEvent<unknown>, column: any) => {
            const isAsc = columnToSort === column && sortDirection === 'asc';

            selectionResetHandler();
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
            selectionResetHandler(!keepSelectionOnPagination);
            setPagination(getPagination(newPage, rowsPerPage));
            setPage(newPage);
        },
        changeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => {
            const newLimit = parseInt(event.target.value, 10);

            selectionResetHandler();
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
            {hideHeaderAndFooter ? null : (
                <Box sx={{ mx: 2 }}>
                    <Stack direction="row" spacing={1}>
                        {showToolbar ? (
                            <Title header={header} marginBottom={2} />
                        ) : null}
                    </Stack>

                    <Toolbar
                        disableGutters
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        {showToolbar ? toolbar : <Title header={header} />}

                        <Stack
                            direction={belowMd ? 'column-reverse' : 'row'}
                            spacing={2}
                        >
                            {ExportComponent ? (
                                <ExportComponent data={selectData ?? []} />
                            ) : null}
                            {hideFilter ? null : (
                                <TextField
                                    inputRef={searchTextField}
                                    // TODO (table filtering)
                                    // Should leverage TablePrefixes setting in the search hook here
                                    //  could handle by somehow tying the search to the actual input
                                    // This is pretty hacky but prevents duplicate IDs a bit better (but not perfect)
                                    id={`entityTable-search__${filterLabel}`}
                                    label={intl.formatMessage({
                                        id: filterLabel,
                                    })}
                                    variant="outlined"
                                    size="small"
                                    defaultValue={searchQuery}
                                    onChange={handlers.filterTable}
                                    sx={{
                                        'width': '100%',
                                        '& .MuiInputBase-root': {
                                            borderRadius: 3,
                                        },
                                    }}
                                />
                            )}
                        </Stack>
                    </Toolbar>
                </Box>
            )}

            <Box sx={hideHeaderAndFooter ? {} : { mb: 2, mx: 2 }}>
                <TableContainer component={Box}>
                    <Table
                        size="small"
                        sx={{ minWidth }}
                        aria-label={intl.formatMessage({
                            id: 'entityTable.title',
                        })}
                    >
                        <EntityTableHeader
                            columns={columns}
                            columnToSort={columnToSort}
                            headerClick={handlers.sort}
                            hide={hideHeaderAndFooter}
                            selectData={selectData}
                            selectableTableStoreName={selectableTableStoreName}
                            sortDirection={sortDirection}
                        />

                        <EntityTableBody
                            columns={columns}
                            rows={dataRows}
                            loading={
                                (isValidating && !hydrated) ||
                                tableState.status === TableStatuses.LOADING
                            }
                            noExistingDataContentIds={noExistingDataContentIds}
                            tableState={tableState}
                        />

                        <EntityTableFooter
                            hide={!dataRows || hideHeaderAndFooter}
                            filterLabel={filterLabel}
                            onPageChange={handlers.changePage}
                            onRowsPerPageChange={handlers.changeRowsPerPage}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            rowsPerPageOptions={rowsPerPageOptions}
                            selectableTableStoreName={selectableTableStoreName}
                        />
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default EntityTable;
