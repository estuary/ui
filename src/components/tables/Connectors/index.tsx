import { Box } from '@mui/material';
import Rows, { tableColumns } from 'components/tables/Connectors/Rows';
import EntityTable, {
    getPagination,
    SortDirection,
} from 'components/tables/EntityTable';
import { createSelectableTableStore } from 'components/tables/Store';
import { useQuery } from 'hooks/supabase-swr';
import {
    ConnectorWithTagDetailQuery,
    CONNECTOR_WITH_TAG_QUERY,
} from 'hooks/useConnectorWithTagDetail';
import { ZustandProvider } from 'hooks/useZustand';
import { useState } from 'react';
import { CONNECTOR_NAME, defaultTableFilter, TABLES } from 'services/supabase';

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
            <ZustandProvider
                createStore={createSelectableTableStore}
                storeName="Connectors-Selectable-Table"
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'connectors.main.message1',
                        message: 'connectors.main.message2',
                        docLink: 'connectors.main.message2.docLink',
                        docPath: 'connectors.main.message2.docPath',
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
                />
            </ZustandProvider>
        </Box>
    );
}

export default ConnectorsTable;
