import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Connectors/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { useQuery } from 'hooks/supabase-swr';
import { useState } from 'react';
import { defaultTableFilter, TABLES } from 'services/supabase';

export interface Connector {
    connector_tags: {
        documentation_url: string;
        protocol: string;
        image_tag: string;
        id: string;
        title: string;
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
        image_tag,
        id,
        endpoint_spec_schema->>title
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
            count: 'exact',
            filter: (query) => {
                return defaultTableFilter<Connector>(
                    query,
                    ['image_name', 'detail'],
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
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                columnToSort={columnToSort}
                setColumnToSort={setColumnToSort}
                header="connectorTable.title"
                filterLabel="connectorTable.filterLabel"
            />
        </Box>
    );
}

export default ConnectorsTable;
