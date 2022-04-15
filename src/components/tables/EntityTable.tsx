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
import { SupabaseClient } from '@supabase/supabase-js';
import ExternalLink from 'components/shared/ExternalLink';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TABLES } from 'services/supabase';
import { PostgrestError, useClient } from 'supabase-swr';

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

interface Entity {
    deploymentStatus: DeploymentStatus;
    name: string;
    catalogNamespace: string;
    connectorType: string;
    dateCreated: string;
}

interface TableState {
    status: TableStatus;
    error?: PostgrestError;
}

interface TableColumn {
    field: keyof Entity | null;
    headerIntlKey: string;
}

interface ConnectorInfo {
    detail: string;
    image_name: string;
}

const CONNECTORS_QUERY = `detail, image_name`;

const LIVE_SPECS_QUERY = `spec_type, catalog_name, updated_at, connector_image_name, id`;

function EntityTable({ noExistingDataContentIds }: Props) {
    const supabaseClient: SupabaseClient = useClient();
    const intl = useIntl();

    const [tableState, setTableState] = useState<TableState>({
        status: TableStatuses.LOADING,
    });

    const [connectors, setConnectors] = useState<any[] | undefined | null>(
        null
    );
    const [publications, setPublications] = useState<any[] | undefined | null>(
        null
    );

    const [unfilteredEntities, setUnfilteredEntities] = useState<
        Entity[] | null
    >(null);
    const [filteredEntities, setFilteredEntities] = useState<Entity[] | null>(
        null
    );
    const [entities, setEntities] = useState<Entity[] | null>(null);

    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] =
        useState<keyof Entity>('dateCreated');

    const [page, setPage] = useState(0);
    const rowsPerPage = 10;
    const rowHeight = 57;

    useEffect(() => {
        console.log('Mounting...');

        (async () => {
            const { data, error } = await supabaseClient
                .from(TABLES.CONNECTORS)
                .select(CONNECTORS_QUERY);

            if (error) {
                setTableState({
                    status: TableStatuses.TECHNICAL_DIFFICULTIES,
                    error,
                });
            } else {
                setConnectors(data);
            }
        })().catch(() => {});

        (async () => {
            const { data, error } = await supabaseClient
                .from(TABLES.LIVE_SPECS)
                .select(LIVE_SPECS_QUERY)
                .eq('spec_type', 'capture');

            if (error) {
                setTableState({
                    status: TableStatuses.TECHNICAL_DIFFICULTIES,
                    error,
                });
            } else {
                setPublications(data);
            }
        })().catch(() => {});
    }, [supabaseClient]);

    useEffect(() => {
        if (publications && connectors) {
            if (publications.length > 0 && connectors.length > 0) {
                const formattedPublication: Entity[] = publications.map(
                    (publication) => {
                        const catalogNamespace: string =
                            publication.catalog_name;

                        const dateCreated: string = publication.updated_at;

                        const connectorInfo: ConnectorInfo | undefined =
                            connectors.find(
                                (connector) =>
                                    connector.image_name ===
                                    publication.connector_image_name
                            );

                        return {
                            deploymentStatus: 'ACTIVE',
                            name: catalogNamespace.substring(
                                catalogNamespace.lastIndexOf('/') + 1,
                                catalogNamespace.length
                            ),
                            catalogNamespace,
                            connectorType: connectorInfo
                                ? connectorInfo.detail
                                : 'Unknown',
                            dateCreated,
                        };
                    }
                );

                setUnfilteredEntities(formattedPublication);
                setTableState({ status: TableStatuses.DATA_FETCHED });
            } else {
                setTableState({ status: TableStatuses.NO_EXISTING_DATA });
            }
        }
    }, [publications, connectors]);

    // TODO: Remove calls to console.log().
    useEffect(() => {
        const subscription = supabaseClient
            .from(TABLES.LIVE_SPECS)
            .on('*', async (payload) => {
                if (payload.new.spec_type === 'capture') {
                    setPublications((_publications) =>
                        _publications
                            ? [..._publications, payload.new]
                            : [payload.new]
                    );
                }
            })
            .subscribe();

        return () => {
            console.log('Will unmount');

            supabaseClient.removeSubscription(subscription).catch(() => {});
        };
    }, [supabaseClient]);

    useEffect(() => {
        if (filteredEntities || unfilteredEntities) {
            setEntities(filteredEntities ?? unfilteredEntities);
        }
    }, [filteredEntities, unfilteredEntities]);

    // TODO: Remove calls to console.log().
    console.log('We here');

    const emptyRows =
        entities && page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - entities.length)
            : 0;

    const columns: TableColumn[] = [
        {
            field: 'name',
            headerIntlKey: 'entityTable.data.entity',
        },
        {
            field: 'connectorType',
            headerIntlKey: 'entityTable.data.connectorType',
        },
        {
            field: 'dateCreated',
            headerIntlKey: 'entityTable.data.lastUpdated',
        },
        {
            field: null,
            headerIntlKey: 'entityTable.data.actions',
        },
    ];

    function descendingComparator<T>(a: T, b: T, selectedColumn: keyof T) {
        if (b[selectedColumn] < a[selectedColumn]) {
            return -1;
        }
        if (b[selectedColumn] > a[selectedColumn]) {
            return 1;
        }
        return 0;
    }

    function getComparator<Key extends keyof any>(
        direction: SortDirection,
        selectedColumn: Key
    ): (
        a: { [key in Key]: number | string },
        b: { [key in Key]: number | string }
    ) => number {
        return direction === 'desc'
            ? (a, b) => descendingComparator(a, b, selectedColumn)
            : (a, b) => -descendingComparator(a, b, selectedColumn);
    }

    // This method is created for cross-browser compatibility, if you don't
    // need to support IE11, you can use Array.prototype.sort() directly.
    function stableSort<T>(
        array: readonly T[],
        comparator: (a: T, b: T) => number
    ) {
        const stabilizedArray = array.map(
            (el, index) => [el, index] as [T, number]
        );
        stabilizedArray.sort((a, b) => {
            const order = comparator(a[0], b[0]);

            if (order !== 0) {
                return order;
            }
            return a[1] - b[1];
        });
        return stabilizedArray.map((el) => el[0]);
    }

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
        filterTable: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const query = event.target.value;

            if (query === '') {
                setFilteredEntities(null);
            } else if (unfilteredEntities) {
                const queriedEntities: Entity[] = unfilteredEntities.filter(
                    ({ catalogNamespace }) => catalogNamespace.includes(query)
                );

                setFilteredEntities(queriedEntities);

                if (queriedEntities.length === 0) {
                    setTableState({ status: TableStatuses.UNMATCHED_FILTER });
                }
            }
        },
        sortRequest: (
            event: React.MouseEvent<unknown>,
            column: keyof Entity
        ) => {
            const isAsc = columnToSort === column && sortDirection === 'asc';

            setSortDirection(isAsc ? 'desc' : 'asc');
            setColumnToSort(column);
        },
        sort: (column: keyof Entity) => (event: React.MouseEvent<unknown>) => {
            handlers.sortRequest(event, column);
        },
        changePage: (
            event: MouseEvent<HTMLButtonElement> | null,
            newPage: number
        ) => {
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
                                            {entities && column.field ? (
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
                            {entities ? (
                                stableSort(
                                    entities,
                                    getComparator(sortDirection, columnToSort)
                                )
                                    .slice(
                                        page * rowsPerPage,
                                        page * rowsPerPage + rowsPerPage
                                    )
                                    .map(
                                        (
                                            {
                                                deploymentStatus,
                                                name,
                                                catalogNamespace,
                                                connectorType,
                                                dateCreated: dateUpdated,
                                            },
                                            index
                                        ) => (
                                            <TableRow
                                                key={`Entity-${name}-${index}`}
                                            >
                                                <TableCell
                                                    sx={{ minWidth: 256 }}
                                                >
                                                    <Tooltip
                                                        title={catalogNamespace}
                                                        placement="bottom-start"
                                                    >
                                                        <Box>
                                                            <span
                                                                style={{
                                                                    height: 16,
                                                                    width: 16,
                                                                    backgroundColor:
                                                                        getDeploymentStatusHexCode(
                                                                            deploymentStatus
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
                                                                {name}
                                                            </span>
                                                        </Box>
                                                    </Tooltip>
                                                </TableCell>

                                                <TableCell
                                                    sx={{ minWidth: 256 }}
                                                >
                                                    {connectorType}
                                                </TableCell>

                                                <TableCell>
                                                    {formatDistanceToNow(
                                                        new Date(dateUpdated),
                                                        {
                                                            addSuffix: true,
                                                        }
                                                    )}
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
                                                            color={
                                                                deploymentStatus ===
                                                                'ACTIVE'
                                                                    ? 'error'
                                                                    : 'success'
                                                            }
                                                            disableElevation
                                                            disabled
                                                        >
                                                            {deploymentStatus ===
                                                            'ACTIVE'
                                                                ? 'Stop'
                                                                : 'Run'}
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
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
                                                {tableState.status ===
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

                        {entities && (
                            <TableFooter>
                                <TableRow>
                                    <TablePagination
                                        rowsPerPageOptions={[rowsPerPage]}
                                        count={entities.length}
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
