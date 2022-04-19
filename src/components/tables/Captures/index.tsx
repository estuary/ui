import { Box } from '@mui/material';
import Rows from 'components/tables/Captures/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { useQuery } from 'hooks/supabase-swr';
import { useState } from 'react';
import { TABLES } from 'services/supabase';

interface LiveSpecQuery {
    spec_type: string;
    catalog_name: string;
    updated_at: string;
    connector_image_name: string;
    id: string;
}

const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: 'connector_image_name',
        headerIntlKey: 'entityTable.data.connectorType',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
    },
];

const queryColumns = [
    'spec_type',
    'catalog_name',
    'updated_at',
    'connector_image_name',
    'id',
];

function CapturesTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

    const liveSpecQuery = useQuery<LiveSpecQuery>(
        TABLES.LIVE_SPECS,
        {
            columns: queryColumns,
            count: 'exact',
            filter: (query) => {
                let queryBuilder = query;

                // // TODO (supabase) Change to text search? https://supabase.com/docs/reference/javascript/textsearch
                if (searchQuery) {
                    queryBuilder = queryBuilder.ilike(
                        'catalog_name',
                        `%${searchQuery}%`
                    );
                }

                return queryBuilder
                    .order(columnToSort, {
                        ascending: sortDirection === 'asc',
                    })
                    .range(pagination.from, pagination.to)
                    .eq('spec_type', 'capture');
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
                rowsPerPage={rowsPerPage}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                columnToSort={columnToSort}
                setColumnToSort={setColumnToSort}
                header="captureTable.header"
            />
        </Box>
    );
}

export default CapturesTable;
