import type { SxProps } from '@mui/material';
import type { DataPlaneScopes } from 'src/stores/DetailsForm/types';
import type { TableState } from 'src/types';
import type { CombinedError } from 'urql';

import { useCallback, useMemo } from 'react';

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
import { TablePrefixes, useTableState } from 'src/stores/Tables/hooks';
import { useTenantStore } from 'src/stores/Tenant';
import { TableStatuses } from 'src/types';

const toolbarStyle: SxProps = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const tableContainerStyle: SxProps = {
    mb: 2,
};

const tableStyle: SxProps = {
    minWidth: 350,
};

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
    const { rowsPerPage, setRowsPerPage } = useTableState(
        TablePrefixes.dataPlanes,
        'name',
        'asc'
    );
    const { currentPage, cursor, goToPage, onPageChange } =
        useCursorPagination();

    const selectedTenant = useTenantStore((state) => state.selectedTenant);
    const { dataPlaneScope, setScope } = useDataPlaneScope();
    const { dataPlanes, fetching, error, pageInfo } = useDataPlanesQuery({
        tenant: selectedTenant,
        public: dataPlaneScope === 'public',
        limit: rowsPerPage,
        cursor,
    });

    const tableState = useMemo<TableState>(() => {
        const status = getTableStatus(dataPlanes, fetching, error);
        return { status };
    }, [error, fetching, dataPlanes]);

    const noExistingDataContentIds = useMemo(() => {
        return DATA_PLANE_SETTINGS[dataPlaneScope].table
            .noExistingDataContentIds;
    }, [dataPlaneScope]);

    const rows = useMemo(() => {
        return dataPlanes.length > 0 ? <Rows data={dataPlanes} /> : null;
    }, [dataPlanes]);

    const slotProps = useMemo(() => {
        const previousButtonDisabled = !pageInfo?.hasPreviousPage;
        const nextButtonDisabled = !pageInfo?.hasNextPage;
        return {
            actions: {
                previousButton: {
                    disabled: previousButtonDisabled,
                },
                nextButton: {
                    disabled: nextButtonDisabled,
                },
            },
        };
    }, [pageInfo?.hasNextPage, pageInfo?.hasPreviousPage]);

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

    const handleRowsPerPageChange = useCallback(
        (event: any) => {
            const newLimit = parseInt(event.target.value, 10);
            onPageChange(event, 0, pageInfo?.endCursor);
            setRowsPerPage(newLimit);
        },
        [onPageChange, setRowsPerPage, pageInfo?.endCursor]
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
            <Toolbar sx={toolbarStyle} disableGutters>
                <ToggleDataPlaneScope
                    scope={dataPlaneScope}
                    onChange={handleDataPlaneScopeChange}
                />
            </Toolbar>

            <TableContainer component={Box} sx={tableContainerStyle}>
                <Table
                    sx={tableStyle}
                    size="small"
                    aria-label="Data Planes Table"
                >
                    <EntityTableHeader columns={columns} />

                    <EntityTableBody
                        rows={rows}
                        columns={columns}
                        loading={fetching}
                        tableState={tableState}
                        noExistingDataContentIds={noExistingDataContentIds}
                    />

                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={-1}
                                page={currentPage}
                                rowsPerPage={rowsPerPage}
                                onPageChange={handlePageChange}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                labelDisplayedRows={labelDisplayedRows}
                                slotProps={slotProps}
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default DataPlanesTable;
