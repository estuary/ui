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
    Tooltip,
} from '@mui/material';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { MouseEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    DeploymentStatus,
    Entity,
    EntityMetadata,
} from 'stores/ChangeSetStore';

interface EntityTableProps {
    entities: Entity[];
}

function ChangeSetTable(props: EntityTableProps) {
    const { entities } = props;

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
    const columns = [
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

    const handleChangePage = (
        event: MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        setPage(newPage);
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
                                        >
                                            <FormattedMessage
                                                id={column.headerIntlKey}
                                            />
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {entityDetails
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
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    disableElevation
                                                >
                                                    Edit
                                                </Button>
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
                                    onPageChange={handleChangePage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            ) : null}
        </Box>
    );
}

export default ChangeSetTable;
