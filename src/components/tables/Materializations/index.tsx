import { Box } from '@mui/material';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import Rows, { tableColumns } from 'components/tables/Materializations/Rows';
import { createSelectableTableStore } from 'components/tables/Store';
import { useQuery } from 'hooks/supabase-swr';
import { ZustandProvider } from 'hooks/useZustand';
import { useState } from 'react';
import { defaultTableFilter, TABLES } from 'services/supabase';

export interface LiveSpecsExtQuery {
    catalog_name: string;
    connector_image_name: string;
    connector_image_tag: string;
    image: string;
    title: string;
    id: string;
    last_pub_id: string;
    last_pub_user_avatar_url: string;
    last_pub_user_email: string;
    last_pub_user_full_name: string;
    reads_from: string[];
    spec_type: string;
    updated_at: string;
}

const queryColumns = [
    'catalog_name',
    'connector_image_name',
    'connector_image_tag',
    'connector_open_graph->en-US->>image',
    'connector_open_graph->en-US->>title',
    'id',
    'last_pub_id',
    'last_pub_user_avatar_url',
    'last_pub_user_email',
    'last_pub_user_full_name',
    'reads_from',
    'spec_type',
    'updated_at',
];

function MaterializationsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [columnToSort, setColumnToSort] = useState<any>('updated_at');

    const liveSpecQuery = useQuery<LiveSpecsExtQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns,
            count: 'exact',
            filter: (query) => {
                return defaultTableFilter<LiveSpecsExtQuery>(
                    query,
                    [
                        'catalog_name',
                        'last_pub_user_full_name',
                        'connector_open_graph->en-US->>title',
                    ],
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
            <ZustandProvider
                createStore={createSelectableTableStore}
                storeName="Materializations-Selectable-Table"
            >
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
                    headerLink="https://docs.estuary.dev/concepts/#materializations"
                    filterLabel="entityTable.filterLabel"
                    enableSelection
                />
            </ZustandProvider>
        </Box>
    );
}

export default MaterializationsTable;
