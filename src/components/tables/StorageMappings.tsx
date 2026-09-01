import type { StorageMappingTableRow } from 'src/api/gql/storageMappings';

import { useEffect } from 'react';

import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';

import { usePaginatedStorageMappings } from 'src/api/gql/storageMappings';
import { AddStorageButton } from 'src/components/admin/Settings/StorageMappings/AddStorageButton';
import { getEntityTableRowSx } from 'src/context/Theme';
import { useCursorPagination } from 'src/hooks/useCursorPagination';
import { useDialog } from 'src/hooks/useDialog';
import { DATA_PLANE_PREFIX } from 'src/settings/dataPlanes';
import { useTenantStore } from 'src/stores/Tenant';

const tableColumns = [
    'Catalog Prefix',
    'Data Planes',
    'Primary Store',
    'Storage Prefix',
] as const;

const columnCount = tableColumns.length;

function Row({ row }: { row: StorageMappingTableRow }) {
    const theme = useTheme();

    const { onOpen } = useDialog('EDIT_STORAGE_MAPPING');

    const store = row.spec.stores?.[0];

    return (
        <TableRow
            hover
            sx={getEntityTableRowSx(theme)}
            onClick={() => onOpen({ prefix: row.catalogPrefix })}
        >
            <TableCell>{row.catalogPrefix}</TableCell>

            <TableCell>
                <Stack>
                    {/* The spec omits data_planes entirely when empty */}
                    {(row.spec.data_planes ?? []).map((dataPlane) => (
                        <Typography key={dataPlane} variant="body2">
                            {dataPlane.replace(DATA_PLANE_PREFIX, '')}
                        </Typography>
                    ))}
                </Stack>
            </TableCell>

            <TableCell>
                {store ? `${store.provider}/${store.bucket}` : null}
            </TableCell>

            <TableCell>{store?.prefix}</TableCell>
        </TableRow>
    );
}

function TenantStorageMappingsTable({
    selectedTenant,
}: {
    selectedTenant: string;
}) {
    const { currentPage, cursor, goToPage, onPageChange } =
        useCursorPagination();

    const { storageMappings, fetching, error, pageInfo, pageSize } =
        usePaginatedStorageMappings(selectedTenant, cursor);

    const handlePageChange = (event: any, page: number) => {
        onPageChange(event, page, pageInfo?.endCursor);
    };

    // A page comes back empty when the mapping list shrinks between fetches,
    // or when a cursor points past the end of the list. The pagination footer
    // renders only for a page that has rows, so step back to keep a Previous
    // control available and to land the user on populated rows.
    useEffect(() => {
        if (
            !fetching &&
            !error &&
            storageMappings.length === 0 &&
            currentPage > 0
        ) {
            goToPage(currentPage - 1);
        }
    }, [fetching, error, storageMappings.length, currentPage, goToPage]);

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
                            storageMappings.map((row) => (
                                <Row
                                    key={`StorageMappings-${row.catalogPrefix}`}
                                    row={row}
                                />
                            ))
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

export function StorageMappingsTable() {
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    // Remount the paginated table when the selected tenant changes so an
    // `after` cursor from the previous tenant is never sent with the new
    // tenant's prefix filter.
    return (
        <TenantStorageMappingsTable
            key={selectedTenant}
            selectedTenant={selectedTenant}
        />
    );
}
