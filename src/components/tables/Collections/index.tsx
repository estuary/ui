import { useMemo } from 'react';

import { Box } from '@mui/material';


import { getLiveSpecs_collections } from 'src/api/liveSpecsExt';
import Rows from 'src/components/tables/Collections/Rows';
import EntityTable from 'src/components/tables/EntityTable';
import { ENTITY_SETTINGS } from 'src/settings/entity';
import { SelectTableStoreNames } from 'src/stores/names';
import { useTableState } from 'src/stores/Tables/hooks';
import TableHydrator from 'src/stores/Tables/Hydrator';
import StatsHydrator from 'src/stores/Tables/StatsHydrator';
import RowSelector from 'src/components/tables/RowActions/RowSelector';
import useCollectionColumns from 'src/components/tables/Collections/useCollectionColumns';
import CollectionExportButton from 'src/components/tables/Collections/Export';
import { selectKeyValueName } from 'src/components/tables/shared';

const selectableTableStoreName = SelectTableStoreNames.COLLECTION;

function CollectionsTable() {
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
                selectableTableStoreName={selectableTableStoreName}
            >
                <StatsHydrator
                    selectableTableStoreName={selectableTableStoreName}
                >
                    <EntityTable
                        ExportComponent={CollectionExportButton}
                        noExistingDataContentIds={
                            ENTITY_SETTINGS.collection.table
                                .noExistingDataContentIds
                        }
                        columns={tableColumns}
                        renderTableRows={(data, showEntityStatus) => (
                            <Rows
                                data={data}
                                showEntityStatus={showEntityStatus}
                            />
                        )}
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
                        header={ENTITY_SETTINGS.collection.table.headerIntlKey}
                        filterLabel={
                            ENTITY_SETTINGS.collection.table.filterIntlKey
                        }
                        showEntityStatus
                        selectableTableStoreName={selectableTableStoreName}
                        showToolbar
                        toolbar={
                            <RowSelector
                                selectableTableStoreName={
                                    selectableTableStoreName
                                }
                                selectKeyValueName={selectKeyValueName}
                                showMaterialize={true}
                                showTransform
                            />
                        }
                    />
                </StatsHydrator>
            </TableHydrator>
        </Box>
    );
}

export default CollectionsTable;
