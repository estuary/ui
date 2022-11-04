import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Captures/Rows';
import EntityTable, { getPagination } from 'components/tables/EntityTable';
import { useQuery } from 'hooks/supabase-swr';
import { useState } from 'react';
import {
    CONNECTOR_IMAGE,
    CONNECTOR_TITLE,
    defaultTableFilter,
    QUERY_PARAM_CONNECTOR_TITLE,
    TABLES,
} from 'services/supabase';
import { SelectTableStoreNames } from 'stores/names';
import { SortDirection } from 'types';
import { LiveSpecsExtQuery } from './types';

const queryColumns = [
    'catalog_name',
    'connector_id',
    'connector_image_name',
    'connector_image_tag',
    CONNECTOR_IMAGE,
    CONNECTOR_TITLE,
    'id',
    'last_pub_id',
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
                    ['catalog_name', QUERY_PARAM_CONNECTOR_TITLE],
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
