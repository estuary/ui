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
import { RealtimeSubscription, SupabaseClient } from '@supabase/supabase-js';
import ExternalLink from 'components/shared/ExternalLink';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TABLES } from 'services/supabase';
import {
    DeploymentStatus,
    Entity,
    EntityMetadata,
} from 'stores/PublicationStore';
import { PostgrestError, useClient } from 'supabase-swr';

enum Statuses {
    LOADING = 'LOADING',
    DATA_FETCHED = 'DATA_FETCHED',
    TECHNICAL_DIFFICULTIES = 'TECHNICAL_DIFFICULTIES',
    UNMATCHED_FILTER = 'UNMATCHED_FILTER',
}

type SortDirection = 'asc' | 'desc';

type Status =
    | Statuses.LOADING
    | Statuses.DATA_FETCHED
    | Statuses.TECHNICAL_DIFFICULTIES
    | Statuses.UNMATCHED_FILTER;

interface Props {
    noExistingDataContentIds: {
        header: string;
        message: string;
        docLink: string;
        docPath: string;
    };
}

interface TableState {
    status: Status;
    error?: PostgrestError;
}

interface TableColumn {
    field: keyof EntityMetadata | null;
    headerIntlKey: string;
}

interface ConnectorInfo {
    detail: string;
    image_name: string;
}

const DISCOVERS_QUERY = `
    capture_name, 
    updated_at, 
    job_status->>type, 
    catalog_spec, 
    id
`;

const CONNECTORS_QUERY = `detail, image_name`;

function EntityTable({ noExistingDataContentIds }: Props) {
    const supabaseClient: SupabaseClient = useClient();
    const intl = useIntl();

    const [tableState, setTableState] = useState<TableState>({
        status: Statuses.LOADING,
    });

    const [connectors, setConnectors] = useState<any[] | null>(null);
    const [discovery, setDiscovery] = useState<any[] | null>(null);
    const [discoverySubscription, setDiscoverySubscription] =
        useState<RealtimeSubscription | null>(null);

    const [unfilteredEntities, setUnfilteredEntities] = useState<
        Entity[] | null
    >(null);
    const [filteredEntities, setFilteredEntities] = useState<Entity[] | null>(
        null
    );
    const [entities, setEntities] = useState<Entity[] | null>(null);

    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] =
        useState<keyof EntityMetadata>('dateCreated');

    const [page, setPage] = useState(0);
    const rowsPerPage = 10;
    const rowHeight = 57;

    // TODO: Remove calls to console.log().
    const getConnectors = async () => {
        const { data, error } = await supabaseClient
            .from(TABLES.CONNECTORS)
            .select(CONNECTORS_QUERY);

        if (error) {
            setTableState({ status: Statuses.TECHNICAL_DIFFICULTIES, error });
            console.log('Connector error caught');
        } else {
            setConnectors(data);
        }

        console.log('connectors');
    };

    // TODO: Remove calls to console.log().
    const getInitialDiscovery = async () => {
        const { data, error } = await supabaseClient
            .from(TABLES.DISCOVERS)
            .select(DISCOVERS_QUERY)
            .eq('job_status->>type', 'success');

        if (error) {
            setTableState({ status: Statuses.TECHNICAL_DIFFICULTIES, error });
            console.log('Discovery error caught');
        } else {
            setDiscovery(data);
        }

        console.log('discovery');
    };

    const createDiscoverySubscription = () => {
        const subscription = supabaseClient
            .from(TABLES.DISCOVERS)
            .on('*', async (payload) => {
                if (payload.new.job_status.type === 'success') {
                    if (discovery) {
                        setDiscovery([...discovery, payload.new]);
                    }
                }
            })
            .subscribe();

        setDiscoverySubscription(subscription);
    };

    useEffect(() => {
        getConnectors().catch(() => {});
        getInitialDiscovery().catch(() => {});

        createDiscoverySubscription();
    }, []);

    useEffect(() => {
        if (discovery && connectors) {
            const formattedDiscovery: Entity[] = discovery.map((discover) => {
                const catalogNamespace: string = discover.capture_name;
                const dateCreated: string = discover.updated_at;
                const catalogResources = discover.catalog_spec.resources;

                // TODO: Improve logic used to retrieve the endpoint description.
                const resourceKey = Object.keys(catalogResources).find(
                    (fileUrl) => fileUrl.includes('.flow.json')
                );

                const rawConnectorImg: string =
                    catalogResources[`${resourceKey}`].content.captures[
                        `${catalogNamespace}`
                    ].endpoint.connector.image;

                const [connectorImg]: string[] = rawConnectorImg.split(':', 1);

                const connectorInfo: ConnectorInfo | undefined =
                    connectors.find(
                        (connector) => connector.image_name === connectorImg
                    );

                return {
                    metadata: {
                        deploymentStatus:
                            discover.type === 'success' ? 'ACTIVE' : 'INACTIVE',
                        name: catalogNamespace.substring(
                            catalogNamespace.lastIndexOf('/') + 1,
                            catalogNamespace.length
                        ),
                        catalogNamespace,
                        connectorType: connectorInfo
                            ? connectorInfo.detail
                            : 'Unknown',
                        dateCreated,
                    },
                    resources: {},
                };
            });

            setUnfilteredEntities(formattedDiscovery);
            setTableState({ status: Statuses.DATA_FETCHED });
        }
    }, [discovery, connectors]);

    // TODO: Manage entities state in the component and update it either in an effect
    // or in a function handler.
    useEffect(() => {
        if (filteredEntities || unfilteredEntities) {
            setEntities(filteredEntities ?? unfilteredEntities);
        }
    }, [filteredEntities, unfilteredEntities]);

    // TODO: Remove calls to console.log().
    useEffect(() => {
        return () => {
            console.log('Will unmount');

            if (discoverySubscription) {
                supabaseClient
                    .removeSubscription(discoverySubscription)
                    .catch(() => {});
            }
        };
    }, []);

    // TODO: Remove calls to console.log().
    console.log('We here');
    console.log(tableState);

    const entityDetails: EntityMetadata[] | null = entities
        ? entities.map((entity) => entity.metadata)
        : null;

    const emptyRows =
        entityDetails && page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - entityDetails.length)
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

    const getEmptyTableHeader = (tableStatus: Statuses): string => {
        switch (tableStatus) {
            case Statuses.TECHNICAL_DIFFICULTIES:
                return 'entityTable.technicalDifficulties.header';
            case Statuses.UNMATCHED_FILTER:
                return 'entityTable.unmatchedFilter.header';
            default:
                return noExistingDataContentIds.header;
        }
    };

    const getEmptyTableMessage = (tableStatus: Statuses): JSX.Element => {
        switch (tableStatus) {
            case Statuses.TECHNICAL_DIFFICULTIES:
                return (
                    <FormattedMessage id="entityTable.technicalDifficulties.message" />
                );
            case Statuses.UNMATCHED_FILTER:
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
                    ({ metadata: { catalogNamespace } }) =>
                        catalogNamespace.includes(query)
                );

                setFilteredEntities(queriedEntities);

                if (queriedEntities.length === 0) {
                    setTableState({ status: Statuses.UNMATCHED_FILTER });
                }
            }
        },
        sortRequest: (
            event: React.MouseEvent<unknown>,
            column: keyof EntityMetadata
        ) => {
            const isAsc = columnToSort === column && sortDirection === 'asc';

            setSortDirection(isAsc ? 'desc' : 'asc');
            setColumnToSort(column);
        },
        sort:
            (column: keyof EntityMetadata) =>
            (event: React.MouseEvent<unknown>) => {
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
                            {entityDetails ? (
                                stableSort(
                                    entityDetails,
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
                                                Statuses.LOADING ? (
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
