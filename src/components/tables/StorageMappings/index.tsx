import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import { usePaginatedStorageMappings } from 'src/api/gql/storageMappings';
import { AddStorageButton } from 'src/components/admin/Settings/StorageMappings/AddStorageButton';
import Rows from 'src/components/tables/StorageMappings/Rows';
import { tableColumns } from 'src/components/tables/StorageMappings/shared';
import { useCursorPagination } from 'src/hooks/useCursorPagination';

function StorageMappingsTable() {
    const intl = useIntl();

    const { currentPage, cursor, onPageChange } = useCursorPagination();

    const { storageMappings, fetching, error, pageInfo, pageSize } =
        usePaginatedStorageMappings(cursor);

    const handlePageChange = (event: any, page: number) => {
        onPageChange(event, page, pageInfo?.endCursor);
    };

    const columnCount = tableColumns.length;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <AddStorageButton />
            </Box>

            {error ? (
                <Typography color="error" sx={{ mb: 2 }}>
                    <FormattedMessage id="storageMappingsTable.error.loadFailed" />
                </Typography>
            ) : null}

            <TableContainer>
                <Table
                    aria-label={intl.formatMessage({
                        id: 'storageMappingsTable.table.aria.label',
                    })}
                >
                    <TableHead>
                        <TableRow>
                            {tableColumns.map((column) => (
                                <TableCell key={column.headerIntlKey}>
                                    {column.headerIntlKey ? (
                                        <FormattedMessage
                                            id={column.headerIntlKey}
                                        />
                                    ) : null}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {fetching && storageMappings.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    sx={{ textAlign: 'center' }}
                                >
                                    <FormattedMessage id="common.loading" />
                                </TableCell>
                            </TableRow>
                        ) : storageMappings.length === 0 && !error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    sx={{ textAlign: 'center', p: 4 }}
                                >
                                    <Typography sx={{ py: 1 }}>
                                        <FormattedMessage id="storageMappingsTable.message1" />
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <Rows data={storageMappings} />
                        )}
                    </TableBody>

                    {pageInfo && storageMappings.length > 0 ? (
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={-1}
                                    page={currentPage}
                                    rowsPerPage={pageSize}
                                    rowsPerPageOptions={[pageSize]}
                                    onPageChange={handlePageChange}
                                    labelDisplayedRows={({ from }) => {
                                        const to =
                                            from + storageMappings.length - 1;
                                        return `${from}–${to}`;
                                    }}
                                    slotProps={{
                                        actions: {
                                            previousButton: {
                                                disabled:
                                                    !pageInfo.hasPreviousPage,
                                            },
                                            nextButton: {
                                                disabled: !pageInfo.hasNextPage,
                                            },
                                        },
                                    }}
                                />
                            </TableRow>
                        </TableFooter>
                    ) : null}
                </Table>
            </TableContainer>
        </Box>
    );
}

export default StorageMappingsTable;
