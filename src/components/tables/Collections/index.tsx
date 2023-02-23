import { Box } from '@mui/material';
import { getLiveSpecs_collections } from 'api/liveSpecsExt';
import Rows from 'components/tables/Collections/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import TableHydrator from 'stores/Tables/Hydrator';
import StatsHydrator from '../Captures/StatsHydrator';
import useTableState from '../hooks';
import useCollectionColumns from './useCollectionColumns';

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
    } = useTableState('col', 'updated_at', 'desc');
    const tableColumns = useCollectionColumns();

    const query = useMemo(() => {
        return getLiveSpecs_collections(pagination, searchQuery, [
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
                selectableTableStoreName={SelectTableStoreNames.COLLECTION}
            >
                <StatsHydrator
                    selectableTableStoreName={SelectTableStoreNames.COLLECTION}
                >
                    <EntityTable
                        noExistingDataContentIds={{
                            header: 'collections.message1',
                            message: 'collections.message2',
                        }}
                        columns={tableColumns}
                        renderTableRows={(data, showEntityStatus) => (
                            <Rows
                                data={data}
                                showEntityStatus={showEntityStatus}
                            />
                        )}
                        pagination={pagination}
                        setPagination={setPagination}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        sortDirection={sortDirection}
                        setSortDirection={setSortDirection}
                        columnToSort={columnToSort}
                        setColumnToSort={setColumnToSort}
                        header="collectionsTable.title"
                        filterLabel="collectionsTable.filterLabel"
                        selectableTableStoreName={
                            SelectTableStoreNames.COLLECTION
                        }
                        showEntityStatus
                    />
                </StatsHydrator>
            </TableHydrator>
        </Box>
    );
}

export default CollectionsTable;
