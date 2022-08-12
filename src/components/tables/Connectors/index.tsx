import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Connectors/Rows';
import EntityTable, { getPagination } from 'components/tables/EntityTable';
import { SelectTableStoreNames } from 'context/Zustand';
import { useQuery } from 'hooks/supabase-swr';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import { useState } from 'react';
import { CONNECTOR_NAME, defaultTableFilter, TABLES } from 'services/supabase';
import { SortDirection } from 'types';

function ConnectorsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [columnToSort, setColumnToSort] = useState<any>(CONNECTOR_NAME);

    const liveSpecQuery = useQuery<ConnectorWithTagDetailQuery>(
        TABLES.CONNECTORS,
        {
            columns: CONNECTOR_WITH_TAG_QUERY,
            count: 'exact',
            filter: (query) => {
                return defaultTableFilter<ConnectorWithTagDetailQuery>(
                    query,
                    [CONNECTOR_NAME],
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
                headerLink="https://docs.estuary.dev/concepts/#connectors"
                filterLabel="connectorTable.filterLabel"
                selectableTableStoreName={SelectTableStoreNames.CONNECTOR}
            />
        </Box>
    );
}

export default ConnectorsTable;
