import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Button,
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
    Tooltip,
    Typography,
} from '@mui/material';
import { PostgrestError } from '@supabase/supabase-js';
import ExternalLink from 'components/shared/ExternalLink';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { useQuery, useSelect } from 'hooks/supabase-swr';
import { debounce } from 'lodash';
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { TABLES } from 'services/supabase';

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

type DeploymentStatus = 'ACTIVE' | 'INACTIVE';

type SortDirection = 'asc' | 'desc';

interface Props {
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

interface LiveSpecQuery {
    spec_type: string;
    catalog_name: string;
    updated_at: string;
    connector_image_name: string;
    id: string;
}

interface TableColumn {
    field: keyof LiveSpecQuery | null;
    headerIntlKey: string;
}

const LIVE_SPECS_QUERY = `
    spec_type, 
    catalog_name, 
    updated_at, 
    connector_image_name, 
    id`;

const rowsPerPage = 5;
const rowHeight = 57;

const stripPathing = (stringVal: string) => {
    return stringVal.substring(
        stringVal.lastIndexOf('/') + 1,
        stringVal.length
    );
};

const getPagination = (currPage: number, size: number) => {
    const limit = size;
    const from = currPage ? currPage * limit : 0;
    const to = currPage ? from + size : size - 1;

    return { from, to };
};

function EntityTable({ noExistingDataContentIds }: Props) {
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] =
        useState<keyof LiveSpecQuery>('updated_at');

    const [page, setPage] = useState(0);
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(page, rowsPerPage)
    );

    const liveSpecQuery = useQuery<LiveSpecQuery>(
        TABLES.LIVE_SPECS,
        {
            columns: LIVE_SPECS_QUERY,
            count: 'exact',
            filter: (query) => {
                let queryBuilder = query;

                // TODO (supabase) Change to text search? https://supabase.com/docs/reference/javascript/textsearch
                if (searchQuery) {
                    queryBuilder = queryBuilder.like(
                        'catalog_name',
                        `%${searchQuery}%`
                    );
                }

                return queryBuilder
                    .order(columnToSort, {
                        ascending: sortDirection === 'asc',
                    })
                    .range(pagination.from, pagination.to)
                    .eq('spec_type', 'capture');
            },
        },
        [sortDirection, columnToSort, searchQuery, rowsPerPage, pagination]
    );
    const { data: liveSpecs, isValidating } = useSelect(liveSpecQuery);
    const publications = liveSpecs ? liveSpecs.data : null;

    const intl = useIntl();

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    useEffect(() => {
        if (publications && publications.length > 0) {
            setTableState({ status: TableStatuses.DATA_FETCHED });
        } else {
            setTableState({ status: TableStatuses.NO_EXISTING_DATA });
        }
    }, [publications, isValidating]);

    const emptyRows = publications
        ? Math.max(0, (1 + page) * rowsPerPage - publications.length)
        : rowsPerPage;

    const columns: TableColumn[] = [
        {
            field: 'catalog_name',
            headerIntlKey: 'entityTable.data.entity',
        },
        {
            field: 'connector_image_name',
            headerIntlKey: 'entityTable.data.connectorType',
        },
        {
            field: 'updated_at',
            headerIntlKey: 'entityTable.data.lastUpdated',
        },
        {
            field: null,
            headerIntlKey: 'entityTable.data.actions',
        },
    ];

    const getDeploymentStatusHexCode = (
        deploymentStatus: DeploymentStatus
    ): string => {
        switch (deploymentStatus) {
            case 'ACTIVE':
                return '#40B763';
            case 'INACTIVE':
                return '#C9393E';
            default:
                return '#F7F7F7';
        }
    };

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
                const query = event.target.value;
                setSearchQuery(query && query.length > 0 ? query : null);
            },
            750
        ),
        sortRequest: (
            event: React.MouseEvent<unknown>,
            column: keyof LiveSpecQuery
        ) => {
            const isAsc = columnToSort === column && sortDirection === 'asc';

            setSortDirection(isAsc ? 'desc' : 'asc');
            setColumnToSort(column);
        },
        sort:
            (column: keyof LiveSpecQuery) =>
            (event: React.MouseEvent<unknown>) => {
                handlers.sortRequest(event, column);
            },
        changePage: (
            event: MouseEvent<HTMLButtonElement> | null,
            newPage: number
        ) => {
            setPagination(getPagination(newPage, rowsPerPage));
            setPage(newPage);
        },
    };

    return (
        <Box>
            <Box sx={{ mx: 2 }}>
                <Toolbar
                    disableGutters
                    sx={{ mb: 2, justifyContent: 'space-between' }}
                >
                    <Typography variant="h6">
                        <FormattedMessage id="captureTable.header" />
                    </Typography>

                    <Box
                        margin={0}
                        sx={{ display: 'flex', alignItems: 'flex-end' }}
                    >
                        <SearchIcon sx={{ mb: 0.9, mr: 0.5, fontSize: 18 }} />
                        <TextField
                            id="capture-search-box"
                            label="Filter Namespaces"
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
                                            {publications && column.field ? (
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
                                                    <FormattedMessage
                                                        id={
                                                            column.headerIntlKey
                                                        }
                                                    />
                                                </TableSortLabel>
                                            ) : (
                                                <FormattedMessage
                                                    id={column.headerIntlKey}
                                                />
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {publications ? (
                                publications.map((publication) => (
                                    <TableRow key={`Entity-${publication.id}`}>
                                        <TableCell sx={{ minWidth: 256 }}>
                                            <Tooltip
                                                title={publication.catalog_name}
                                                placement="bottom-start"
                                            >
                                                <Box>
                                                    <span
                                                        style={{
                                                            height: 16,
                                                            width: 16,
                                                            backgroundColor:
                                                                getDeploymentStatusHexCode(
                                                                    'ACTIVE'
                                                                ),
                                                            borderRadius: 50,
                                                            display:
                                                                'inline-block',
                                                            verticalAlign:
                                                                'middle',
                                                            marginRight: 12,
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            verticalAlign:
                                                                'middle',
                                                        }}
                                                    >
                                                        {stripPathing(
                                                            publication.catalog_name
                                                        )}
                                                    </span>
                                                </Box>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell sx={{ minWidth: 256 }}>
                                            {stripPathing(
                                                publication.connector_image_name
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <Tooltip
                                                title={
                                                    <FormattedDate
                                                        day="numeric"
                                                        month="long"
                                                        year="numeric"
                                                        hour="2-digit"
                                                        minute="2-digit"
                                                        second="2-digit"
                                                        value={
                                                            publication.updated_at
                                                        }
                                                    />
                                                }
                                                placement="bottom-start"
                                            >
                                                <Box>
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            publication.updated_at
                                                        ),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
                                                </Box>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    disableElevation
                                                    disabled
                                                    sx={{ mr: 1 }}
                                                >
                                                    Edit
                                                </Button>

                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    color="success"
                                                    disableElevation
                                                    disabled
                                                >
                                                    Stop
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4}>
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
                                                        </Typography>{' '}
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                            {emptyRows > 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        sx={{
                                            height: rowHeight * emptyRows,
                                        }}
                                    />
                                </TableRow>
                            )}
                        </TableBody>

                        {publications && liveSpecs?.count && (
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        rowsPerPageOptions={[rowsPerPage]}
                                        count={liveSpecs.count}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handlers.changePage}
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
