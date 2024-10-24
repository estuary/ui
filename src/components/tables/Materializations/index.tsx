import { Box } from '@mui/material';
import { getLiveSpecs_materializations } from 'api/liveSpecsExt';
import EntityTable from 'components/tables/EntityTable';
import Rows from 'components/tables/Materializations/Rows';
import RowSelector from 'components/tables/RowActions/RowSelector';
import { useMemo } from 'react';
import { ENTITY_SETTINGS } from 'settings/entity';
import { SelectTableStoreNames } from 'stores/names';
import { useTableState } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import StatsHydrator from 'stores/Tables/StatsHydrator';
import MaterializationExportButton from './Export';
import useMaterializationColumns from './useMaterializationColumns';

const selectableTableStoreName = SelectTableStoreNames.MATERIALIZATION;

function MaterializationsTable() {
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
    } = useTableState('mat', 'updated_at', 'desc');
    const tableColumns = useMaterializationColumns();

    const query = useMemo(() => {
        return getLiveSpecs_materializations(pagination, searchQuery, [
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
                        ExportComponent={MaterializationExportButton}
                        noExistingDataContentIds={
                            ENTITY_SETTINGS.materialization.table
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
                        header={
                            ENTITY_SETTINGS.materialization.table.headerIntlKey
                        }
                        filterLabel={
                            ENTITY_SETTINGS.materialization.table.filterIntlKey
                        }
                        showEntityStatus={true}
                        selectableTableStoreName={selectableTableStoreName}
                        showToolbar
                        toolbar={
                            <RowSelector
                                selectableTableStoreName={
                                    selectableTableStoreName
                                }
                            />
                        }
                    />
                </StatsHydrator>
            </TableHydrator>
        </Box>
    );
}

export default MaterializationsTable;
