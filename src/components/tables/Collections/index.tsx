import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Collections/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { useQuery } from 'hooks/supabase-swr';
import { CollectionStoreNames } from 'hooks/useZustand';
import { useState } from 'react';
import { defaultTableFilter, TABLES } from 'services/supabase';

export interface LiveSpecsQuery {
    spec_type: string;
    catalog_name: string;
    updated_at: string;
    id: string;
}

// const queryColumns = ['id', 'spec_type', 'catalog_name', 'updated_at'];

function CollectionsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

    const liveSpecQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: '*',
            count: 'exact',
            filter: (query) => {
                return defaultTableFilter<LiveSpecsQuery>(
                    query,
                    ['catalog_name', 'last_pub_user_full_name'],
                    searchQuery,
                    columnToSort,
                    sortDirection,
                    pagination
                ).eq('spec_type', 'collection');
            },
        },
        [pagination, searchQuery, columnToSort, sortDirection]
    );

    return (
        <Box>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'collections.message1',
                    message: 'collections.message2',
                }}
                columns={tableColumns}
                query={liveSpecQuery}
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
                headerLink="https://docs.estuary.dev/concepts/#collections"
                filterLabel="collectionsTable.filterLabel"
                selectableTableStoreName={CollectionStoreNames.SELECT_TABLE}
            />
        </Box>
    );
}

export default CollectionsTable;
