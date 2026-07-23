import { useMemo } from 'react';

import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import Rows from 'src/components/tables/DataPlanes/Rows';
import ToggleDataPlaneScope from 'src/components/tables/DataPlanes/ToggleDataPlaneScope';
import { useDataPlaneScope } from 'src/context/DataPlaneScopeContext';
import { useDataPlanes } from 'src/hooks/dataPlanes/useDataPlanes';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { useTenantStore } from 'src/stores/Tenant';

const columns = ['', 'Name', 'Region', 'IPv4'] as const;

const columnCount = columns.length;

function DataPlanesTable() {
    const { dataPlaneScope } = useDataPlaneScope();
    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const { dataPlanes, loading, error } = useDataPlanes();

    // Data planes come back scoped to what the user can read. Public planes
    // are shown as-is; private planes are narrowed to the selected tenant so
    // the toggle mirrors the tenant-scoped view of the settings page.
    const filterPrefix = useMemo(() => {
        if (dataPlaneScope === 'public') {
            return DATA_PLANE_SETTINGS.public.prefix;
        }

        return selectedTenant
            ? `${DATA_PLANE_SETTINGS.private.prefix}${selectedTenant}`
            : null;
    }, [dataPlaneScope, selectedTenant]);

    const rows = useMemo(
        () =>
            filterPrefix
                ? dataPlanes.filter((dataPlane) =>
                      dataPlane.name.startsWith(filterPrefix)
                  )
                : [],
        [dataPlanes, filterPrefix]
    );

    const emptyMessage =
        dataPlaneScope === 'private'
            ? 'To configure a private data plane, please contact support.'
            : 'No data planes found.';

    return (
        <Box>
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                <ToggleDataPlaneScope />
            </Stack>

            {error ? (
                <Typography color="error" sx={{ mb: 2 }}>
                    There was an issue reaching our servers. Please try again.
                </Typography>
            ) : null}

            <TableContainer>
                <Table aria-label="Data Planes Table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableCell key={column || `column-${index}`}>
                                    {column}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading && rows.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    sx={{ textAlign: 'center' }}
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : rows.length === 0 && !error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columnCount}
                                    sx={{ textAlign: 'center', p: 4 }}
                                >
                                    <Typography sx={{ py: 1 }}>
                                        {emptyMessage}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            <Rows data={rows} />
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default DataPlanesTable;
