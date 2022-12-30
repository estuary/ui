import { Box } from '@mui/material';
import { getGrants, getGrants_Users } from 'api/combinedGrantsExt';
import Rows, { userTableColumns } from 'components/tables/AccessGrants/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import TableHydrator from 'stores/Tables/Hydrator';
import useTableState from '../hooks';

interface Props {
    showUser?: boolean;
}

function AccessGrantsTable({ showUser }: Props) {
    const {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState(showUser ? 'user_full_name' : 'subject_role');

    const query = useMemo(() => {
        if (showUser) {
            return getGrants_Users(pagination, searchQuery, [
                {
                    col: columnToSort,
                    direction: sortDirection,
                },
            ]);
        } else {
            return getGrants(pagination, searchQuery, [
                {
                    col: columnToSort,
                    direction: sortDirection,
                },
            ]);
        }
    }, [columnToSort, pagination, searchQuery, showUser, sortDirection]);

    const headerKey = showUser
        ? 'accessGrantsTable.users.title'
        : 'accessGrantsTable.prefixes.title';
    const filterKey = showUser
        ? 'accessGrantsTable.users.filterLabel'
        : 'accessGrantsTable.prefixes.filterLabel';

    return (
        <Box>
            <TableHydrator
                query={query}
                selectableTableStoreName={
                    showUser
                        ? SelectTableStoreNames.ACCESS_GRANTS_USERS
                        : SelectTableStoreNames.ACCESS_GRANTS_PREFIXES
                }
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'accessGrants.message1',
                        message: 'accessGrants.message2',
                        disableDoclink: true,
                    }}
                    columns={userTableColumns}
                    renderTableRows={(data) => (
                        <Rows data={data} showUser={showUser} />
                    )}
                    setPagination={setPagination}
                    setSearchQuery={setSearchQuery}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    columnToSort={columnToSort}
                    setColumnToSort={setColumnToSort}
                    header={headerKey}
                    filterLabel={filterKey}
                    selectableTableStoreName={
                        showUser
                            ? SelectTableStoreNames.ACCESS_GRANTS_USERS
                            : SelectTableStoreNames.ACCESS_GRANTS_PREFIXES
                    }
                />
            </TableHydrator>
        </Box>
    );
}

export default AccessGrantsTable;
