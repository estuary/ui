import { Box } from '@mui/material';
import { getStorageMappings } from 'api/storageMappings';
import StorageMappingsGenerateButton from 'components/admin/Settings/StorageMappings/GenerateButton';
import EntityTable from 'components/tables/EntityTable';
import { ReactNode, useMemo } from 'react';
import TableHydrator from 'stores/Tables/Hydrator';
import { useTableState } from 'stores/Tables/hooks';
import { useTenantStore } from 'stores/Tenant/Store';
import { SelectTableStoreNames } from 'stores/names';
import Rows, { tableColumns } from './Rows';

interface Props {
    header: ReactNode;
}

function StorageMappingsTable({ header }: Props) {
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
                    header={header}
                    filterLabel="storageMappingsTable.filterLabel"
                    selectableTableStoreName={
                        SelectTableStoreNames.STORAGE_MAPPINGS
                    }
                    showToolbar
                    toolbar={<StorageMappingsGenerateButton />}
                    hideFilter
                    tableAriaLabelKey="storageMappingsTable.table.aria.label"
                />
            </TableHydrator>
        </Box>
    );
}

export default StorageMappingsTable;
