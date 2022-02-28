import InfoIcon from '@mui/icons-material/Info';
import {
    Box,
    IconButton,
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
import { MouseEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import useChangeSetStore, {
    CaptureState,
    EntityMetadata,
} from '../stores/ChangeSetStore';

const getCapturesSelector = (state: CaptureState) => state.captures;

function ChangeSetTable() {
    const [page, setPage] = useState(0);
    const rowsPerPage = 4;

    const handleChangePage = (
        event: MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        setPage(newPage);
    };

    const captureState = useChangeSetStore(getCapturesSelector);
    const captures = Object.values(captureState);

    const captureDetails: EntityMetadata[] = captures.map(
        (capture) => capture.metadata
    );

    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - captureDetails.length)
            : 0;

    const intl = useIntl();
    const columns = [
        {
            field: 'entityType',
            headerIntlKey: 'changeSet.data.entityType',
        },
        {
            field: 'name',
            headerIntlKey: 'changeSet.data.entity',
        },
        {
            field: 'user',
            headerIntlKey: 'changeSet.data.user',
        },
        {
            field: 'changeType',
            headerIntlKey: 'changeSet.data.details',
        },
    ];

    return (
        <Box sx={{ mx: 2 }}>
            {captures.length > 0 ? (
                <TableContainer component={Box}>
                    <Table
                        sx={{ minWidth: 350 }}
                        aria-label={intl.formatMessage({
                            id: 'changeSet.title',
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
                            {captureDetails
                                .slice(
                                    page * rowsPerPage,
                                    page * rowsPerPage + rowsPerPage
                                )
                                .map(
                                    (
                                        {
                                            name,
                                            entityType,
                                            namespace,
                                            user,
                                            changeType,
                                        },
                                        index
                                    ) => (
                                        <TableRow
                                            key={`Entity-${name}-${index}`}
                                        >
                                            <TableCell>{entityType}</TableCell>
                                            <TableCell sx={{ minWidth: 216 }}>
                                                <span>{name}</span>
                                                <Tooltip title={namespace}>
                                                    <IconButton
                                                        sx={{ ml: 0.5, p: 0.5 }}
                                                    >
                                                        <InfoIcon
                                                            sx={{
                                                                fontSize: 16,
                                                            }}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>{user}</TableCell>
                                            <TableCell>{changeType}</TableCell>
                                        </TableRow>
                                    )
                                )}
                            {emptyRows > 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        sx={{ height: 57 * emptyRows }}
                                    />
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    rowsPerPageOptions={[rowsPerPage]}
                                    count={captures.length}
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
