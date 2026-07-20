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

import { usePaginatedStorageMappings } from 'src/api/gql/storageMappings';
import { AddStorageButton } from 'src/components/admin/Settings/StorageMappings/AddStorageButton';
import Rows from 'src/components/tables/StorageMappings/Rows';
import { useCursorPagination } from 'src/hooks/useCursorPagination';

const tableColumns = [
    'Catalog Prefix',
    'Data Planes',
    'Primary Store',
    'Storage Prefix',
] as const;

const columnCount = tableColumns.length;

function StorageMappingsTable() {
    const { currentPage, cursor, onPageChange } = useCursorPagination();

    const { storageMappings, fetching, error, pageInfo, pageSize } =
        usePaginatedStorageMappings(cursor);

    const handlePageChange = (event: any, page: number) => {
        onPageChange(event, page, pageInfo?.endCursor);
    };

    return (
        <Box sx={{ my: 2 }}>
            <AddStorageButton />

            {error ? (
                <Typography color="error" sx={{ mb: 2 }}>
                    Failed to load storage locations.
                </Typography>
            ) : null}

            <TableContainer>
                <Table aria-label="Storage Locations Table">
                    <TableHead>
                        <TableRow>
                            {tableColumns.map((column) => (
                                <TableCell key={column}>{column}</TableCell>
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
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : storageMappings.length === 0 && !error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    sx={{ textAlign: 'center', p: 4 }}
                                >
                                    <Typography sx={{ py: 1 }}>
                                        No results found.
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
