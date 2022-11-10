import { Box } from '@mui/material';
import { getConnectors } from 'api/connectors';
import Rows, { tableColumns } from 'components/tables/Connectors/Rows';
import EntityTable, { getPagination } from 'components/tables/EntityTable';
import { useMemo, useState } from 'react';
import { CONNECTOR_NAME } from 'services/supabase';
import { SelectTableStoreNames } from 'stores/names';
import { SortDirection } from 'types';

function ConnectorsTable() {
    const rowsPerPage = 10;
    const [pagination, setPagination] = useState<{ from: number; to: number }>(
        getPagination(0, rowsPerPage)
    );
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [columnToSort, setColumnToSort] = useState<any>(CONNECTOR_NAME);

    const query = useMemo(() => {
        return getConnectors(
            pagination,
            searchQuery,
            columnToSort,
            sortDirection
        );
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <Box>
            <EntityTable
                noExistingDataContentIds={{
                    header: 'connectors.main.message1',
                    message: 'connectors.main.message2',
                }}
                columns={tableColumns}
                query={query}
                renderTableRows={(data) => <Rows data={data} />}
                setPagination={setPagination}
                setSearchQuery={setSearchQuery}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                columnToSort={columnToSort}
                setColumnToSort={setColumnToSort}
                header="connectorTable.title"
                filterLabel="connectorTable.filterLabel"
                selectableTableStoreName={SelectTableStoreNames.CONNECTOR}
            />
        </Box>
    );
}

export default ConnectorsTable;
