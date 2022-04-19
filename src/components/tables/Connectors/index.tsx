import { Box } from '@mui/material';
import Rows from 'components/tables/Captures/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { useQuery } from 'hooks/supabase-swr';
import { useState } from 'react';
import { TABLES } from 'services/supabase';

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

interface ConnectorTag {
    connectors: {
        detail: string;
        image_name: string;
    };
    id: string;
    image_tag: string;
    protocol: string;
    updated_at: string;
}

const CONNECTOR_TAGS_QUERY = `
    connectors(
        detail,
        image_name
    ),
    id,
    image_tag,
    protocol,
    updated_at
`;

function ConnectorsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

    const liveSpecQuery = useQuery<ConnectorTag>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_TAGS_QUERY,
            filter: (query) => {
                let queryBuilder = query;

                // // TODO (supabase) Change to text search? https://supabase.com/docs/reference/javascript/textsearch
                if (searchQuery) {
                    queryBuilder = queryBuilder.like(
                        'protocol',
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
        []
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
