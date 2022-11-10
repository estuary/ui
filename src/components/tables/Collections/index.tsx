import { Box } from '@mui/material';
import { getLiveSpecs_collections } from 'api/liveSpecsExt';
import Rows, { tableColumns } from 'components/tables/Collections/Rows';
import EntityTable, { getPagination } from 'components/tables/EntityTable';
import { useMemo, useState } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { SortDirection } from 'types';

function CollectionsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

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
        </Box>
    );
}

export default CollectionsTable;
