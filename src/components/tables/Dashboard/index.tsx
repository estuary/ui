import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Dashboard/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { useQuery } from 'hooks/supabase-swr';
import { useState } from 'react';
import { defaultTableFilter, TABLES } from 'services/supabase';

export interface LiveSpecsQuery {
    spec_type: string;
    catalog_name: string;
    updated_at: string;
    id: string;
}

const queryColumns = ['id', 'spec_type', 'catalog_name', 'updated_at'];

function DashboardTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

    const liveSpecQuery = useQuery<LiveSpecsQuery>(
        TABLES.LIVE_SPECS,
        {
            columns: queryColumns,
            count: 'exact',
            filter: (query) => {
                return defaultTableFilter<LiveSpecsQuery>(
                    query,
                    ['catalog_name'],
                    searchQuery,
                    columnToSort,
                    sortDirection,
                    pagination
                );
            },
        },
        [pagination, searchQuery, columnToSort, sortDirection]
    );

    return (
        <Box>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'captures.main.message1',
                    message: 'captures.main.message2',
                    docLink: 'captures.main.message2.docLink',
                    docPath: 'captures.main.message2.docPath',
                }}
                columns={tableColumns}
                query={liveSpecQuery}
                renderTableRows={(data) => <Rows data={data} />}
                setPagination={setPagination}
                setSearchQuery={setSearchQuery}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                columnToSort={columnToSort}
                setColumnToSort={setColumnToSort}
                header="captureTable.header"
                filterLabel="entityTable.filterLabel"
            />
        </Box>
    );
}

export default DashboardTable;
