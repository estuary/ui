import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Captures/Rows';
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
    connector_image_name: string;
    id: string;
    last_pub_id: string;
    writes_to: string[];
}

const queryColumns = [
    'spec_type',
    'catalog_name',
    'updated_at',
    'connector_image_name',
    'id',
    'last_pub_id',
    'writes_to',
];

function CapturesTable() {
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
                ).eq('spec_type', 'capture');
            },
        },
        [pagination, searchQuery, columnToSort, sortDirection]
    );

    return (
        <Box>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'captures.message1',
                    message: 'captures.message2',
                    docLink: 'captures.message2.docLink',
                    docPath: 'captures.message2.docPath',
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

export default CapturesTable;
