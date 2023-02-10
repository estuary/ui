import { Box } from '@mui/material';
import { getStorageMappings } from 'api/storageMappings';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import TableHydrator from 'stores/Tables/Hydrator';
import useTableState from '../hooks';
import Rows, { tableColumns } from './Rows';

function StorageMappingsTable() {
    const {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('catalog_prefix');

    const query = useMemo(() => {
        return getStorageMappings(pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <Box>
            <TableHydrator
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
                    pagination={pagination}
                    setPagination={setPagination}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    columnToSort={columnToSort}
                    setColumnToSort={setColumnToSort}
                    header="storageMappingsTable.title"
                    filterLabel="storageMappingsTable.filterLabel"
                    selectableTableStoreName={
                        SelectTableStoreNames.STORAGE_MAPPINGS
                    }
                />
            </TableHydrator>
        </Box>
    );
}

export default StorageMappingsTable;
