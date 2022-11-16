import { Box } from '@mui/material';
import { getLiveSpecs_materializations } from 'api/liveSpecsExt';
import EntityTable from 'components/tables/EntityTable';
import Rows, { tableColumns } from 'components/tables/Materializations/Rows';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import TableHydrator from 'stores/Tables/Hydrator';
import useTableState from '../hooks';

function MaterializationsTable() {
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
        return getLiveSpecs_materializations(
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
                selectableTableStoreName={SelectTableStoreNames.MATERIALIZATION}
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'materializations.message1',
                        message: 'materializations.message2',
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
                    header="materializationsTable.title"
                    filterLabel="materializationsTable.filterLabel"
                    rowSelectorProps={{
                        selectableTableStoreName:
                            SelectTableStoreNames.MATERIALIZATION,
                    }}
                    showEntityStatus={true}
                    enableSelection
                    selectableTableStoreName={
                        SelectTableStoreNames.MATERIALIZATION
                    }
                />
            </TableHydrator>
        </Box>
    );
}

export default MaterializationsTable;
