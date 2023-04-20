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
import RowSelector from 'components/tables/RowActions/RowSelector';
import Title from 'components/tables/Title';
import { useZustandStore } from 'context/Zustand/provider';
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
import { useIntl } from 'react-intl';
import { useEffectOnce } from 'react-use';
import { Pagination } from 'services/supabase';
import { SelectTableStoreNames } from 'stores/names';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import {
    SortDirection,
    TableIntlConfig,
    TableState,
    TableStatuses,
} from 'types';
import { RowSelectorProps } from '../RowActions/types';
import EntityTableBody from './TableBody';
import EntityTableFooter from './TableFooter';
import EntityTableHeader from './TableHeader';
import { ColumnProps } from './types';

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
    noExistingDataContentIds: TableIntlConfig;
    selectableTableStoreName: SelectTableStoreNames;
    enableSelection?: boolean;
    rowSelectorProps?: RowSelectorProps;
    showEntityStatus?: boolean;
    hideHeaderAndFooter?: boolean;
    rowsPerPageOptions?: number[];
    minWidth?: number;
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
    hideHeaderAndFooter,
    rowsPerPageOptions = [10, 25, 50],
    minWidth = 350,
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
            {hideHeaderAndFooter ? null : (
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
                            selectableTableStoreName={selectableTableStoreName}
                            sortDirection={sortDirection}
                        />

                        <EntityTableBody
                            columns={columns}
                            rows={dataRows}
                            loading={
                                isValidating ||
                                tableState.status === TableStatuses.LOADING
                            }
                            noExistingDataContentIds={noExistingDataContentIds}
                            tableState={tableState}
                        />

                        <EntityTableFooter
                            hide={!dataRows || hideHeaderAndFooter}
                            onPageChange={handlers.changePage}
                            onRowsPerPageChange={handlers.changeRowsPerPage}
                            page={page}
                            rowsPerPage={rowsPerPage}
                            selectableTableStoreName={selectableTableStoreName}
                        />
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default EntityTable;
