import { Box } from '@mui/material';
import Rows from 'components/tables/Connectors/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { useQuery } from 'hooks/supabase-swr';
import { useState } from 'react';
import { TABLES } from 'services/supabase';

const tableColumns = [
    {
        field: 'image_name',
        headerIntlKey: 'connectorTable.data.image_name',
    },
    {
        field: 'detail',
        headerIntlKey: 'connectorTable.data.detail',
    },
    {
        field: 'connector_tags.protocol',
        headerIntlKey: 'connectorTable.data.protocol',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'connectorTable.data.updated_at',
    },
    {
        field: null,
        headerIntlKey: 'connectorTable.data.documentation_url',
    },
    {
        field: null,
        headerIntlKey: 'connectorTable.data.actions',
    },
];

export interface Connector {
    connector_tags: {
        documentation_url: string;
        protocol: string;
        image_tag: string;
    }[];
    id: string;
    detail: string;
    updated_at: string;
    image_name: string;
}

const CONNECTOR_QUERY = `
    id,
    detail,
    updated_at,
    image_name,
    connector_tags (
        documentation_url,
        protocol,
        image_tag
    )
`;

function ConnectorsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

    const liveSpecQuery = useQuery<Connector>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTOR_QUERY,
            filter: (query) => {
                console.log('query here');

                let queryBuilder = query;

                // // TODO (supabase) Change to text search? https://supabase.com/docs/reference/javascript/textsearch
                if (searchQuery) {
                    queryBuilder = queryBuilder.ilike(
                        'image_name',
                        `%${searchQuery}%`
                    );
                }

                return queryBuilder
                    .order(columnToSort, {
                        ascending: sortDirection === 'asc',
                    })
                    .range(pagination.from, pagination.to);
            },
        },
        [pagination, searchQuery, columnToSort, sortDirection]
    );

    return (
        <Box>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'admin.connectors.main.message1',
                    message: 'admin.connectors.main.message2',
                    docLink: 'admin.connectors.main.message2.docLink',
                    docPath: 'admin.connectors.main.message2.docPath',
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
            />
        </Box>
    );
}

export default ConnectorsTable;
