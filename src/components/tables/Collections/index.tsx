import { Box } from '@mui/material';
import { getLiveSpecs_collections } from 'api/liveSpecsExt';
import Rows from 'components/tables/Collections/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import TableHydrator from 'stores/Tables/Hydrator';
import StatsHydrator from 'stores/Tables/StatsHydrator';
import { useTableState } from 'stores/Tables/hooks';
import { SelectTableStoreNames } from 'stores/names';
import { ENTITY_SETTINGS } from 'settings/entity';
import RowSelector from '../RowActions/RowSelector';
import { selectKeyValueName } from '../shared';
import useCollectionColumns from './useCollectionColumns';
import CollectionExportButton from './Export';

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
