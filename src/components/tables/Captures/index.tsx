import { Box } from '@mui/material';
import { getLiveSpecs_captures } from 'api/liveSpecsExt';
import Rows, { tableColumns } from 'components/tables/Captures/Rows';
import EntityTable, { getPagination } from 'components/tables/EntityTable';
import { useMemo, useState } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { SortDirection } from 'types';

function CapturesTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

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
            <EntityTable
                noExistingDataContentIds={{
                    header: 'captures.message1',
                    message: 'captures.message2',
                }}
                columns={tableColumns}
                addStatsToQuery
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
                rowSelectorProps={{
                    selectableTableStoreName: SelectTableStoreNames.CAPTURE,
                    showMaterialize: true,
                }}
                showEntityStatus={true}
                selectableTableStoreName={SelectTableStoreNames.CAPTURE}
            />
        </Box>
    );
}

export default CapturesTable;
