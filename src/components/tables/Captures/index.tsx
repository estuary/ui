import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Captures/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { createSelectableTableStore } from 'components/tables/Store';
import { useQuery } from 'hooks/supabase-swr';
import { ZustandProvider } from 'hooks/useZustand';
import { useState } from 'react';
import { defaultTableFilter, TABLES } from 'services/supabase';
import { ENTITY } from 'types';

export interface LiveSpecsExtQuery {
    catalog_name: string;
    connector_image_name: string | null;
    connector_image_tag: string | null;
    image: string;
    title: string;
    id: string;
    last_pub_id: string;
    last_pub_user_avatar_url: string | null;
    last_pub_user_email: string;
    last_pub_user_full_name: string | null;
    spec_type: ENTITY;
    updated_at: string;
    writes_to: string[];
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
    'spec_type',
    'updated_at',
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

    const liveSpecQuery = useQuery<LiveSpecsExtQuery>(
        TABLES.LIVE_SPECS_EXT,
        {
            columns: queryColumns,
            count: 'exact',
            filter: (query) => {
                return defaultTableFilter<LiveSpecsExtQuery>(
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
            <ZustandProvider
                createStore={createSelectableTableStore}
                storeName="Captures-Selectable-Table"
            >
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
                    headerLink="https://docs.estuary.dev/concepts/#captures"
                    filterLabel="entityTable.filterLabel"
                    enableSelection
                    rowSelectorProps={{
                        showMaterialize: true,
                    }}
                />
            </ZustandProvider>
        </Box>
    );
}

export default CapturesTable;
