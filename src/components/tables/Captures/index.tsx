import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Captures/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { useQuery } from 'hooks/supabase-swr';
import { SelectTableStoreNames } from 'context/Zustand';
import { useState } from 'react';
import { defaultTableFilter, TABLES } from 'services/supabase';
import { LiveSpecsExtBaseQuery } from 'types';

export interface LiveSpecsExtQuery extends LiveSpecsExtBaseQuery {
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
                    [
                        'catalog_name',
                        'last_pub_user_full_name',
                        'connector_open_graph->en-US->>title',
                    ],
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
                }}
                columns={tableColumns}
                query={liveSpecQuery}
                renderTableRows={(data, showEntityStatus) => (
                    <Rows data={data} showEntityStatus={showEntityStatus} />
                )}
                setPagination={setPagination}
                setSearchQuery={setSearchQuery}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                columnToSort={columnToSort}
                setColumnToSort={setColumnToSort}
                header="captureTable.header"
                headerLink="https://docs.estuary.dev/concepts/#captures"
                filterLabel="capturesTable.filterLabel"
                enableSelection
                rowSelectorProps={{
                    selectableTableStoreName: SelectTableStoreNames.CAPTURE,
                    showMaterialize: true,
                }}
                showEntityStatus={true}
                selectableTableStoreName={SelectTableStoreNames.CAPTURE}
            />
        </Box>
    );
}

export default CapturesTable;
