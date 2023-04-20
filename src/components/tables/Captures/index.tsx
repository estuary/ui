import { Box } from '@mui/material';
import { getLiveSpecs_captures } from 'api/liveSpecsExt';
import Rows from 'components/tables/Captures/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import useTableState from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import StatsHydrator from 'stores/Tables/StatsHydrator';
import useCaptureColumns from './useCaptureColumns';

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
    } = useTableState('cap', 'updated_at', 'desc');
    const tableColumns = useCaptureColumns();

    const query = useMemo(() => {
        return getLiveSpecs_captures(pagination, searchQuery, [
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
                selectableTableStoreName={SelectTableStoreNames.CAPTURE}
            >
                <StatsHydrator
                    selectableTableStoreName={SelectTableStoreNames.CAPTURE}
                >
                    <EntityTable
                        enableSelection
                        noExistingDataContentIds={{
                            header: 'captures.message1',
                            message: 'captures.message2',
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
                        header="captureTable.header"
                        filterLabel="capturesTable.filterLabel"
                        rowSelectorProps={{
                            selectableTableStoreName:
                                SelectTableStoreNames.CAPTURE,
                            showMaterialize: true,
                        }}
                        showEntityStatus={true}
                        selectableTableStoreName={SelectTableStoreNames.CAPTURE}
                    />
                </StatsHydrator>
            </TableHydrator>
        </Box>
    );
}

export default CapturesTable;
