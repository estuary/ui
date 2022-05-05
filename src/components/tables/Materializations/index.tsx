import { Box } from '@mui/material';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import Rows, { tableColumns } from 'components/tables/Materializations/Rows';
import { useQuery } from 'hooks/supabase-swr';
import { useState } from 'react';
import { defaultTableFilter, TABLES } from 'services/supabase';

export interface LiveSpecsQuery {
    spec_type: string;
    catalog_name: string;
    updated_at: string;
    id: string;
    last_pub_id: string;
    reads_from: string[];
}

const queryColumns = [
    'spec_type',
    'catalog_name',
    'updated_at',
    'id',
    'last_pub_id',
    'reads_from',
];

function MaterializationsTable() {
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
                ).eq('spec_type', 'materialization');
            },
        },
        [pagination, searchQuery, columnToSort, sortDirection]
    );

    return (
        <Box>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'materializations.message1',
                    message: 'materializations.message2',
                    docLink: 'materializations.message2.docLink',
                    docPath: 'materializations.message2.docPath',
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
                header="materializationsTable.title"
                filterLabel="entityTable.filterLabel"
            />
        </Box>
    );
}

export default MaterializationsTable;
