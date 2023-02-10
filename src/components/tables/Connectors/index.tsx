import { Box } from '@mui/material';
import { getConnectors } from 'api/connectors';
import Rows, { tableColumns } from 'components/tables/Connectors/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { CONNECTOR_NAME } from 'services/supabase';
import { SelectTableStoreNames } from 'stores/names';
import TableHydrator from 'stores/Tables/Hydrator';
import useTableState from '../hooks';

function ConnectorsTable() {
    const {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState(CONNECTOR_NAME);

    const query = useMemo(() => {
        return getConnectors(pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <Box>
            <TableHydrator
                query={query}
                selectableTableStoreName={SelectTableStoreNames.CONNECTOR}
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'connectors.main.message1',
                        message: 'connectors.main.message2',
                    }}
                    columns={tableColumns}
                    renderTableRows={(data) => <Rows data={data} />}
                    pagination={pagination}
                    setPagination={setPagination}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    columnToSort={columnToSort}
                    setColumnToSort={setColumnToSort}
                    header="connectorTable.title"
                    filterLabel="connectorTable.filterLabel"
                    selectableTableStoreName={SelectTableStoreNames.CONNECTOR}
                />
            </TableHydrator>
        </Box>
    );
}

export default ConnectorsTable;
