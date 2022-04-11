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
    Tooltip,
} from '@mui/material';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { MouseEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    DeploymentStatus,
    Entity,
    EntityMetadata,
} from 'stores/PublicationStore';

type SortDirection = 'asc' | 'desc';

interface Props {
    entities: Entity[];
}

interface TableColumn {
    field: keyof EntityMetadata | null;
    headerIntlKey: string;
}

function EntityTable({ entities }: Props) {
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] =
        useState<keyof EntityMetadata>('dateCreated');

    const [page, setPage] = useState(0);
    const rowsPerPage = 10;
    const rowHeight = 57;

    const entityDetails: EntityMetadata[] = entities.map(
        (entity) => entity.metadata
    );

    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - entityDetails.length)
            : 0;

    const intl = useIntl();
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
                return '#000000';
        }
    };

    const handlers = {
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
        pageChange: (
            event: MouseEvent<HTMLButtonElement> | null,
            newPage: number
        ) => {
            setPage(newPage);
        },
        deploymentStatusUpdate:
            (catalogNamespace: string, deploymentStatus: DeploymentStatus) =>
            () => {
                // TODO: Change the deployment status of the entity.
                console.log(
                    `Set the deployment status of ${catalogNamespace} to ${deploymentStatus}`
                );
            },
    };

    return (
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
                                                columnToSort === column.field
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
                                                    id={column.headerIntlKey}
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
                                            <TableCell sx={{ minWidth: 216 }}>
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
                                            <TableCell>
                                                {connectorType}
                                            </TableCell>
                                            <TableCell>
                                                {formatDistanceToNow(
                                                    new Date(dateUpdated),
                                                    { addSuffix: true }
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex' }}>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        disableElevation
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Edit
                                                    </Button>

                                                    {deploymentStatus ===
                                                    'ACTIVE' ? (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            color="error"
                                                            disableElevation
                                                            onClick={handlers.deploymentStatusUpdate(
                                                                catalogNamespace,
                                                                'INACTIVE'
                                                            )}
                                                        >
                                                            Stop
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            color="success"
                                                            disableElevation
                                                            onClick={handlers.deploymentStatusUpdate(
                                                                catalogNamespace,
                                                                'ACTIVE'
                                                            )}
                                                        >
                                                            Run
                                                        </Button>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )
                                )}
                            {emptyRows > 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        sx={{ height: rowHeight * emptyRows }}
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
                                    onPageChange={handlers.pageChange}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            ) : null}
        </Box>
    );
}

export default EntityTable;
