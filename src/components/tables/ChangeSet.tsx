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
import { MouseEvent, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import useChangeSetStore, {
    CaptureState,
    EntityMetadata,
} from 'stores/ChangeSetStore';

const selectors = {
    captures: (state: CaptureState) => state.captures,
    newChangeCount: (state: CaptureState) => state.newChangeCount,
    resetNewChangeCount: (state: CaptureState) => state.resetNewChangeCount,
};

function ChangeSetTable() {
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;

    const handleChangePage = (
        event: MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => {
        setPage(newPage);
    };

    const newChangeCount = useChangeSetStore(selectors.newChangeCount);
    const resetNewChangeCount = useChangeSetStore(
        selectors.resetNewChangeCount
    );
    const captureState = useChangeSetStore(selectors.captures);

    useEffect(() => {
        if (newChangeCount > 0) {
            resetNewChangeCount();
        }
    }, [newChangeCount, resetNewChangeCount]);

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
            field: 'changeType',
            headerIntlKey: 'changeSet.data.details',
        },
    ];

    return (
        <Box sx={{ mb: 2, mx: 2 }}>
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
                                            catalogNamespace,
                                            changeType,
                                        },
                                        index
                                    ) => (
                                        <TableRow
                                            key={`Entity-${name}-${index}`}
                                        >
                                            <TableCell>{entityType}</TableCell>
                                            <TableCell sx={{ minWidth: 216 }}>
                                                <Tooltip
                                                    title={catalogNamespace}
                                                    placement="bottom-start"
                                                >
                                                    <IconButton
                                                        sx={{ mr: 0.5, p: 0.5 }}
                                                    >
                                                        <InfoIcon
                                                            sx={{
                                                                fontSize: 16,
                                                            }}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                                <span>{name}</span>
                                            </TableCell>
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
