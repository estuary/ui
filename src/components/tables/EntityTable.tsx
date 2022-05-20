import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    LinearProgress,
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
import ExternalLink from 'components/shared/ExternalLink';
import RowSelector from 'components/tables/RowSelector';
import { SelectableTableStore } from 'components/tables/Store';
import { Query, useSelect } from 'hooks/supabase-swr';
import { useZustandStore } from 'hooks/useZustand';
import { debounce } from 'lodash';
import { ChangeEvent, MouseEvent, ReactNode, useEffect, useState } from 'react';
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
    renderTableRows: (data: any) => ReactNode;
    setPagination: (data: any) => void;
    setSearchQuery: (data: any) => void;
    sortDirection: SortDirection;
    setSortDirection: (data: any) => void;
    columnToSort: string;
    setColumnToSort: (data: any) => void;
    header: string;
    filterLabel: string;
    noExistingDataContentIds: {
        header: string;
        message: string;
        docLink: string;
        docPath: string;
    };
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
    filterLabel,
}: Props) {
    const [page, setPage] = useState(0);

    const { data: useSelectResponse, isValidating } = useSelect(query);
    const selectData = useSelectResponse ? useSelectResponse.data : null;

    const intl = useIntl();

    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    useEffect(() => {
        if (selectData && selectData.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [selectData, isValidating]);

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
                const { message, docLink, docPath } = noExistingDataContentIds;

                return (
                    <FormattedMessage
                        id={message}
                        values={{
                            docLink: (
                                <ExternalLink
                                    link={intl.formatMessage({ id: docPath })}
                                >
                                    <FormattedMessage id={docLink} />
                                </ExternalLink>
                            ),
                        }}
                    />
                );
            }
        }
    };

    const handlers = {
        filterTable: debounce(
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const filterQuery = event.target.value;
                setSearchQuery(
                    filterQuery && filterQuery.length > 0 ? filterQuery : null
                );
            },
            750
        ),
        sortRequest: (event: React.MouseEvent<unknown>, column: any) => {
            const isAsc = columnToSort === column && sortDirection === 'asc';

            setSortDirection(isAsc ? 'desc' : 'asc');
            setColumnToSort(column);
        },
        sort: (column: any) => (event: React.MouseEvent<unknown>) => {
            handlers.sortRequest(event, column);
        },
        changePage: (
            event: MouseEvent<HTMLButtonElement> | null,
            newPage: number
        ) => {
            setPagination(getPagination(newPage, rowsPerPage));
            setPage(newPage);
        },
        changeRowsPerPage: (event: ChangeEvent<HTMLInputElement>) => {
            const newLimit = parseInt(event.target.value, 10);
            setRowsPerPage(newLimit);
            setPagination(getPagination(0, newLimit));
            setPage(0);
        },
    };

    const selectedRows = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['selected']
    >((state) => state.selected);

    return (
        <Box>
            <Box sx={{ mx: 2 }}>
                <Toolbar
                    disableGutters
                    sx={{ mb: 2, justifyContent: 'space-between' }}
                >
                    <Typography variant="h6">
                        <FormattedMessage id={header} />
                    </Typography>

                    <RowSelector />

                    <Box
                        margin={0}
                        sx={{ display: 'flex', alignItems: 'flex-end' }}
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
                                {selectedRows.size > 0 ? (
                                    <>
                                        <TableCell>
                                            {selectedRows.size}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            colSpan={columns.length - 1}
                                        >
                                            Enable / Disable
                                        </TableCell>
                                    </>
                                ) : (
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
                                                    {selectData &&
                                                    column.field ? (
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
                                )}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {selectData && selectData.length > 0 ? (
                                renderTableRows(selectData)
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
                                            <Box width={485}>
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
                                                        <Typography>
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
