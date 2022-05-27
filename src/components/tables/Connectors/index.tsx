import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Connectors/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { createSelectableTableStore } from 'components/tables/Store';
import { useQuery } from 'hooks/supabase-swr';
import { ZustandProvider } from 'hooks/useZustand';
import { useState } from 'react';
import { defaultTableFilter, TABLES } from 'services/supabase';
import { OpenGraph } from 'types';

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
    open_graph: OpenGraph;
}

const CONNECTOR_QUERY = `
    id,
    detail,
    updated_at,
    image_name,
    open_graph,
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
            <ZustandProvider
                createStore={createSelectableTableStore}
                storeName="Connectors-Selectable-Table"
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'connectors.main.message1',
                        message: 'connectors.main.message2',
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
            </ZustandProvider>
        </Box>
    );
}

export default ConnectorsTable;
