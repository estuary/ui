import SearchIcon from '@mui/icons-material/Search';
import {
    Box,
    Button,
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
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ChangeEvent, MouseEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { TABLES } from 'services/supabase';
import {
    DeploymentStatus,
    Entity,
    EntityMetadata,
} from 'stores/PublicationStore';
import { useQuery, useSelect } from 'supabase-swr';

type SortDirection = 'asc' | 'desc';

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

function EntityTable() {
    const intl = useIntl();

    const [filteredEntities, setFilteredEntities] = useState<Entity[] | null>(
        null
    );

    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] =
        useState<keyof EntityMetadata>('dateCreated');

    const [page, setPage] = useState(0);
    const rowsPerPage = 10;
    const rowHeight = 57;

    const connectorsQuery = useQuery<any>(
        TABLES.CONNECTORS,
        { columns: CONNECTORS_QUERY },
        []
    );
    const { data: connectors } = useSelect(connectorsQuery, {});

    const tagsQuery = useQuery<any>(
        TABLES.DISCOVERS,
        {
            columns: DISCOVERS_QUERY,
            filter: (query) => query.eq('job_status->>type', 'success'),
        },
        []
    );
    const { data: discovers } = useSelect(tagsQuery, {});

    let unfilteredEntities: Entity[] = [];

    if (discovers && connectors) {
        unfilteredEntities = discovers.data.map((discover) => {
            const catalogNamespace: string = discover.capture_name;
            const dateCreated: string = discover.updated_at;
            const catalogResources = discover.catalog_spec.resources;

            // TODO: Improve logic used to retrieve the endpoint description.
            const resourceKey = Object.keys(catalogResources).find((fileUrl) =>
                fileUrl.includes('.flow.json')
            );

            const rawConnectorImg: string =
                catalogResources[`${resourceKey}`].content.captures[
                    `${catalogNamespace}`
                ].endpoint.connector.image;

            const [connectorImg]: string[] = rawConnectorImg.split(':', 1);

            const connectorInfo: ConnectorInfo | undefined =
                connectors.data.find(
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
    }

    const entities = filteredEntities ?? unfilteredEntities;

    const entityDetails: EntityMetadata[] = entities.map(
        (entity) => entity.metadata
    );

    const emptyRows =
        page > 0
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

    const getDeploymentStatusHexCode = (status: DeploymentStatus): string => {
        switch (status) {
            case 'ACTIVE':
                return '#40B763';
            case 'INACTIVE':
                return '#C9393E';
            default:
                return '#F7F7F7';
        }
    };

    const handlers = {
        filterTable: (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
            const query = event.target.value;

            if (query === '') {
                setFilteredEntities(null);
            } else {
                const queriedEntities: Entity[] = unfilteredEntities.filter(
                    ({ metadata: { catalogNamespace } }) =>
                        catalogNamespace.includes(query)
                );

                setFilteredEntities(queriedEntities);
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
                {entities.length > 0 ? (
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
                                                    columnToSort ===
                                                    column.field
                                                        ? sortDirection
                                                        : false
                                                }
                                            >
                                                {column.field ? (
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
                                                        id={
                                                            column.headerIntlKey
                                                        }
                                                    />
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stableSort(
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
                                                        { addSuffix: true }
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Box
                                                        sx={{ display: 'flex' }}
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
                        </Table>
                    </TableContainer>
                ) : null}
            </Box>
        </Box>
    );
}

export default EntityTable;
