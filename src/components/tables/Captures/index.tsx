import { Box } from '@mui/material';
import { getLiveSpecs_captures } from 'api/liveSpecsExt';
import Rows, { tableColumns } from 'components/tables/Captures/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import TableHydrator from 'stores/Tables/Hydrator';
import useTableState from '../hooks';

function CapturesTable() {
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
        return getLiveSpecs_captures(
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
                selectableTableStoreName={SelectTableStoreNames.CAPTURE}
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'captures.message1',
                        message: 'captures.message2',
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
                    header="captureTable.header"
                    filterLabel="capturesTable.filterLabel"
                    enableSelection
                    enableTimeFiltering
                    rowSelectorProps={{
                        selectableTableStoreName: SelectTableStoreNames.CAPTURE,
                        showMaterialize: true,
                    }}
                    showEntityStatus={true}
                    selectableTableStoreName={SelectTableStoreNames.CAPTURE}
                />
            </TableHydrator>
        </Box>
    );
}

export default CapturesTable;
