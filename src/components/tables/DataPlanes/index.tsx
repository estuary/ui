import type { DataPlaneScopes } from 'src/stores/DetailsForm/types';
import type { CombinedError } from 'urql';

import { useCallback, useEffect } from 'react';

import {
    Box,
    Table,
    TableContainer,
    TableFooter,
    TablePagination,
    TableRow,
    Toolbar,
} from '@mui/material';

import Rows from 'src/components/tables/DataPlanes/Rows';
import { columns } from 'src/components/tables/DataPlanes/shared';
import ToggleDataPlaneScope from 'src/components/tables/DataPlanes/ToggleDataPlaneScope';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { useDataPlaneScope } from 'src/context/DataPlaneScopeContext';
import { useDataPlanesQuery } from 'src/hooks/dataPlanes/useDataPlanes';
import { useCursorPagination } from 'src/hooks/useCursorPagination';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { useTenantStore } from 'src/stores/Tenant';
import { TableStatuses } from 'src/types';

const PAGE_SIZE = 10;

function getTableStatus<T>(data: T[], loading: boolean, error?: CombinedError) {
    if (loading) {
        return TableStatuses.LOADING;
    }

    if (error) {
        return error.networkError
            ? TableStatuses.NETWORK_FAILED
            : TableStatuses.TECHNICAL_DIFFICULTIES;
    }

    return data.length > 0
        ? TableStatuses.DATA_FETCHED
        : TableStatuses.NO_EXISTING_DATA;
}

function DataPlanesTable() {
    const { currentPage, cursor, goToPage, onPageChange } =
        useCursorPagination();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const { dataPlaneScope, setScope } = useDataPlaneScope();
    const { dataPlanes, fetching, error, pageInfo } = useDataPlanesQuery(
        selectedTenant,
        {
            public: dataPlaneScope === 'public',
            limit: PAGE_SIZE,
            cursor,
        }
    );

    const status = getTableStatus(dataPlanes, fetching, error);
    const settings = DATA_PLANE_SETTINGS[dataPlaneScope].table;

    // reset to first page when changing tenant
    useEffect(() => {
        goToPage(0);
        // exclude goToPage from the deps list as the function reference changes everytime
        // goToPage(0) is called (since it both updates and depends on cursorHistory). Including
        // it will cause an infinite render loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTenant]);

    const handleDataPlaneScopeChange = useCallback(
        (newScope: DataPlaneScopes) => {
            setScope(newScope);
            goToPage(0); // reset to first page when changing scope to support cursor pagination
        },
        [goToPage, setScope]
    );

    const handlePageChange = useCallback(
        (event: any, newPage: number) => {
            onPageChange(event, newPage, pageInfo?.endCursor);
        },
        [onPageChange, pageInfo?.endCursor]
    );

    const labelDisplayedRows = useCallback(
        ({ from }: { from: number }) => {
            return dataPlanes.length > 0
                ? `${from} – ${from + dataPlanes.length - 1}`
                : '';
        },
        [dataPlanes.length]
    );

    return (
        <Box data-public>
            <Toolbar
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
                disableGutters
            >
                <ToggleDataPlaneScope
                    scope={dataPlaneScope}
                    onChange={handleDataPlaneScopeChange}
                />
            </Toolbar>

            <TableContainer
                component={Box}
                sx={{
                    mb: 2,
                }}
            >
                <Table
                    sx={{
                        minWidth: 350,
                    }}
                    size="small"
                    aria-label="Data Planes Table"
                >
                    <EntityTableHeader columns={columns} />

                    <EntityTableBody
                        rows={
                            dataPlanes.length > 0 ? (
                                <Rows data={dataPlanes} />
                            ) : null
                        }
                        columns={columns}
                        loading={fetching}
                        tableState={{ status }}
                        noExistingDataContentIds={
                            settings.noExistingDataContentIds
                        }
                    />

                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={-1}
                                page={currentPage}
                                rowsPerPage={PAGE_SIZE}
                                rowsPerPageOptions={[PAGE_SIZE]}
                                onPageChange={handlePageChange}
                                labelDisplayedRows={labelDisplayedRows}
                                slotProps={{
                                    actions: {
                                        previousButton: {
                                            disabled:
                                                !pageInfo?.hasPreviousPage,
                                        },
                                        nextButton: {
                                            disabled: !pageInfo?.hasNextPage,
                                        },
                                    },
                                }}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default DataPlanesTable;
