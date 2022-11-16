import { Box } from '@mui/material';
import { getLiveSpecs_collections } from 'api/liveSpecsExt';
import Rows, { tableColumns } from 'components/tables/Collections/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import TableHydrator from 'stores/Tables/Hydrator';
import useTableState from '../hooks';

function CollectionsTable() {
    const {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('updated_at', 'desc');

    const query = useMemo(() => {
        return getLiveSpecs_collections(
            pagination,
            searchQuery,
            columnToSort,
            sortDirection
        );
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <Box>
            <TableHydrator
                query={query}
                selectableTableStoreName={SelectTableStoreNames.COLLECTION}
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'collections.message1',
                        message: 'collections.message2',
                    }}
                    columns={tableColumns}
                    query={query}
                    renderTableRows={(data, showEntityStatus) => (
                        <Rows data={data} showEntityStatus={showEntityStatus} />
                    )}
                    setPagination={setPagination}
                    setSearchQuery={setSearchQuery}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    columnToSort={columnToSort}
                    setColumnToSort={setColumnToSort}
                    header="collectionsTable.title"
                    filterLabel="collectionsTable.filterLabel"
                    selectableTableStoreName={SelectTableStoreNames.COLLECTION}
                />
            </TableHydrator>
        </Box>
    );
}

export default CollectionsTable;
