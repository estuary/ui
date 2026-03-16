import { useMemo } from 'react';

import { Box } from '@mui/material';

import { getStorageMappings } from 'src/api/storageMappings';
import { AddStorageButton } from 'src/components/admin/Settings/StorageMappings/AddStorageButton';
import EntityTable from 'src/components/tables/EntityTable';
import Rows from 'src/components/tables/StorageMappings/Rows';
import { tableColumns } from 'src/components/tables/StorageMappings/shared';
import { SelectTableStoreNames } from 'src/stores/names';
import { useTableState } from 'src/stores/Tables/hooks';
import TableHydrator from 'src/stores/Tables/Hydrator';
import { useTenantStore } from 'src/stores/Tenant/Store';

function StorageMappingsTable() {
    const {
        pagination,
        setPagination,
        rowsPerPage,
        setRowsPerPage,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('sm', 'catalog_prefix');

    const selectedTenant = useTenantStore((state) => state.selectedTenant);

    const query = useMemo(() => {
        return selectedTenant
            ? getStorageMappings(selectedTenant, pagination, searchQuery, [
                  {
                      col: columnToSort,
                      direction: sortDirection,
                  },
              ])
            : null;
    }, [columnToSort, pagination, searchQuery, selectedTenant, sortDirection]);

    return (
        <Box>
            <TableHydrator
                disableQueryParamHack
                query={query}
                selectableTableStoreName={
                    SelectTableStoreNames.STORAGE_MAPPINGS
                }
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'storageMappingsTable.message1',
                        message: 'storageMappingsTable.message2',
                        disableDoclink: true,
                    }}
                    columns={tableColumns}
                    renderTableRows={(data) => <Rows data={data} />}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    pagination={pagination}
                    setPagination={setPagination}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    columnToSort={columnToSort}
                    setColumnToSort={setColumnToSort}
                    header={null}
                    filterLabel="storageMappingsTable.filterLabel"
                    selectableTableStoreName={
                        SelectTableStoreNames.STORAGE_MAPPINGS
                    }
                    showToolbar
                    toolbar={<AddStorageButton />}
                    hideFilter
                    tableAriaLabelKey="storageMappingsTable.table.aria.label"
                />
            </TableHydrator>
        </Box>
    );
}

export default StorageMappingsTable;
