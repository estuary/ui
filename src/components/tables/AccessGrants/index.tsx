import { Box } from '@mui/material';
import { getGrantsForEverything } from 'api/combinedGrantsExt';
import Rows, { tableColumns } from 'components/tables/AccessGrants/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import TableHydrator from 'stores/Tables/Hydrator';
import useTableState from '../hooks';

function AccessGrantsTable() {
    const {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('user_full_name');

    const query = useMemo(() => {
        return getGrantsForEverything(
            pagination,
            searchQuery,
            columnToSort,
            sortDirection
        );
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <Box>
            <TableHydrator
                query={query}
                selectableTableStoreName={SelectTableStoreNames.ACCESS_GRANTS}
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'accessGrants.message1',
                        message: 'accessGrants.message2',
                        disableDoclink: true,
                    }}
                    columns={tableColumns}
                    renderTableRows={(data) => <Rows data={data} />}
                    setPagination={setPagination}
                    setSearchQuery={setSearchQuery}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    columnToSort={columnToSort}
                    setColumnToSort={setColumnToSort}
                    header="accessGrantsTable.title"
                    filterLabel="accessGrantsTable.filterLabel"
                    selectableTableStoreName={
                        SelectTableStoreNames.ACCESS_GRANTS
                    }
                />
            </TableHydrator>
        </Box>
    );
}

export default AccessGrantsTable;
