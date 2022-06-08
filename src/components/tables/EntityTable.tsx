import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    IconButton,
    LinearProgress,
    Link,
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
import { PostgrestError } from '@supabase/supabase-js';
import MessageWithLink from 'components/content/MessageWithLink';
import RowSelector, {
    RowSelectorProps,
} from 'components/tables/RowActions/RowSelector';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'components/tables/Store';
import { Query, useSelect } from 'hooks/supabase-swr';
import { useZustandStore } from 'hooks/useZustand';
import { debounce } from 'lodash';
import {
    ChangeEvent,
    MouseEvent,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

enum TableStatuses {
    LOADING = 'LOADING',
    DATA_FETCHED = 'DATA_FETCHED',
    NO_EXISTING_DATA = 'NO_EXISTING_DATA',
    TECHNICAL_DIFFICULTIES = 'TECHNICAL_DIFFICULTIES',
    UNMATCHED_FILTER = 'UNMATCHED_FILTER',
}

type TableStatus =
    | TableStatuses.LOADING
    | TableStatuses.DATA_FETCHED
    | TableStatuses.NO_EXISTING_DATA
    | TableStatuses.TECHNICAL_DIFFICULTIES
    | TableStatuses.UNMATCHED_FILTER;

export type SortDirection = 'asc' | 'desc';

interface Props {
    columns: {
        field: string | null;
        headerIntlKey: string | null;
    }[];
    query: Query<any>;
    renderTableRows: (data: any, showEntityStatus: boolean) => ReactNode;
    setPagination: (data: any) => void;
    setSearchQuery: (data: any) => void;
    sortDirection: SortDirection;
    setSortDirection: (data: any) => void;
    columnToSort: string;
    setColumnToSort: (data: any) => void;
    header: string;
    headerLink?: string;
    filterLabel: string;
    enableSelection?: boolean;
    rowSelectorProps?: RowSelectorProps;
    tableDescriptionId?: string;
    noExistingDataContentIds: {
        header: string;
        message: string;
        disableDoclink?: boolean;
    };
    showEntityStatus?: boolean;
}

interface TableState {
    status: TableStatus;
    error?: PostgrestError;
}

export const getPagination = (currPage: number, size: number) => {
    const limit = size;
    const from = currPage ? currPage * limit : 0;
    const to = currPage ? from + size : size - 1;

    return { from, to };
};

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
    headerLink,
    filterLabel,
    enableSelection,
    rowSelectorProps,
    showEntityStatus = false,
    tableDescriptionId,
}: Props) {
    const [page, setPage] = useState(0);
    const isFiltering = useRef(false);

    const { data: useSelectResponse, isValidating } = useSelect(query);
    const selectData = useSelectResponse ? useSelectResponse.data : null;

    const intl = useIntl();

    const setRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setRows']
    >(selectableTableStoreSelectors.rows.set);

    const resetRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['removeRows']
    >(selectableTableStoreSelectors.rows.reset);

    const setAll = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setAllSelected']
    >(selectableTableStoreSelectors.selected.setAll);

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

    const getEmptyTableHeader = (tableStatus: TableStatuses): string => {
        switch (tableStatus) {
            case TableStatuses.TECHNICAL_DIFFICULTIES:
                return 'entityTable.technicalDifficulties.header';
            case TableStatuses.UNMATCHED_FILTER:
                return 'entityTable.unmatchedFilter.header';
            default:
                return noExistingDataContentIds.header;
        }
    };

    const getEmptyTableMessage = (tableStatus: TableStatuses): JSX.Element => {
        switch (tableStatus) {
            case TableStatuses.TECHNICAL_DIFFICULTIES:
                return (
                    <FormattedMessage id="entityTable.technicalDifficulties.message" />
                );
            case TableStatuses.UNMATCHED_FILTER:
                return (
                    <FormattedMessage id="entityTable.unmatchedFilter.message" />
                );
            default: {
                const { disableDoclink, message } = noExistingDataContentIds;

                if (disableDoclink) {
                    <FormattedMessage id={message} />;
                }

                return <MessageWithLink messageID={message} />;
            }
        }
    };

    const resetSelection = () => {
        if (enableSelection) {
            setAll(false);

            resetRows();
        }
        enableSelection ? setAll(false) : null;
    };

    const handlers = {
        filterTable: debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;
                const hasQuery = Boolean(filterQuery && filterQuery.length > 0);

                isFiltering.current = hasQuery;

                resetSelection();
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

    return (
        <Box>
            <Box sx={{ mx: 2 }}>
                <Stack direction="row" spacing={1}>
                    <Typography
                        variant="h6"
                        sx={{
                            alignItems: 'center',
                        }}
                    >
                        <FormattedMessage id={header} />
                    </Typography>

                    {headerLink ? (
                        <Link target="_blank" rel="noopener" href={headerLink}>
                            <IconButton size="small">
                                <HelpIcon />
                            </IconButton>
                        </Link>
                    ) : null}
                </Stack>

                {tableDescriptionId ? (
                    <Box>
                        <MessageWithLink messageID={tableDescriptionId} />
                    </Box>
                ) : null}

                <Toolbar
                    disableGutters
                    sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: enableSelection
                            ? 'space-between'
                            : 'flex-end',
                        alignItems: 'center',
                    }}
                >
                    {enableSelection ? (
                        <RowSelector {...rowSelectorProps} />
                    ) : null}

                    <Box sx={{ display: 'flex', alignItems: 'flex-end', m: 0 }}>
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
                                <>
                                    {columns.map((column, index) => {
                                        return (
                                            <TableCell
                                                key={`${column.field}-${index}`}
                                                sortDirection={
                                                    columnToSort ===
                                                    column.field
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
                                                        id={
                                                            column.headerIntlKey
                                                        }
                                                    />
                                                ) : null}
                                            </TableCell>
                                        );
                                    })}
                                </>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {selectData && selectData.length > 0 ? (
                                renderTableRows(selectData, showEntityStatus)
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                py: 4,
                                            }}
                                        >
                                            <Box width={450}>
                                                {isValidating ||
                                                tableState.status ===
                                                    TableStatuses.LOADING ? (
                                                    <Box>
                                                        <LinearProgress />
                                                    </Box>
                                                ) : (
                                                    <>
                                                        <Typography
                                                            variant="h6"
                                                            align="center"
                                                            sx={{ mb: 2 }}
                                                        >
                                                            <FormattedMessage
                                                                id={getEmptyTableHeader(
                                                                    tableState.status
                                                                )}
                                                            />
                                                        </Typography>
                                                        <Typography component="div">
                                                            {getEmptyTableMessage(
                                                                tableState.status
                                                            )}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                        {selectData &&
                            selectData.length > 0 &&
                            useSelectResponse?.count && (
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            rowsPerPageOptions={
                                                rowsPerPageOptions
                                            }
                                            count={useSelectResponse.count}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handlers.changePage}
                                            onRowsPerPageChange={
                                                handlers.changeRowsPerPage
                                            }
                                        />
                                    </TableRow>
                                </TableFooter>
                            )}
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default EntityTable;
