import { Box } from '@mui/material';
import { getGrants, getGrants_Users } from 'api/combinedGrantsExt';
import AccessLinksButton from 'components/tables/AccessGrants/AccessLinks/Dialog/Button';
import DataShareButton from 'components/tables/AccessGrants/DataSharing/Dialog/Button';
import PrefixRows, {
    prefixTableColumns,
} from 'components/tables/AccessGrants/PrefixRows';
import UserRows, {
    userTableColumns,
} from 'components/tables/AccessGrants/UserRows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import TableHydrator from 'stores/Tables/Hydrator';
import { TablePrefix, useTableState } from 'stores/Tables/hooks';
import { SelectTableStoreNames } from 'stores/names';
import RowSelector from '../RowActions/AccessGrants/RowSelector';

interface Props {
    tablePrefix: TablePrefix;
    showUser?: boolean;
}

function AccessGrantsTable({ tablePrefix, showUser }: Props) {
    const {
        pagination,
        setPagination,
        rowsPerPage,
        setRowsPerPage,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState(tablePrefix, showUser ? 'user_full_name' : 'object_role');

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
    const tableKey = showUser
        ? 'accessGrantsTable.users.table.aria.label'
        : 'accessGrantsTable.prefixes.table.aria.label';

    return (
        <Box sx={{ mb: showUser ? 8 : 0 }}>
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
                    columns={showUser ? userTableColumns : prefixTableColumns}
                    renderTableRows={(data) =>
                        showUser ? (
                            <UserRows data={data} />
                        ) : (
                            <PrefixRows data={data} />
                        )
                    }
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    pagination={pagination}
                    setPagination={setPagination}
                    searchQuery={searchQuery}
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
                    showToolbar
                    toolbar={
                        <RowSelector
                            additionalCTA={
                                showUser ? (
                                    <AccessLinksButton />
                                ) : (
                                    <DataShareButton />
                                )
                            }
                            selectTableStoreName={
                                showUser
                                    ? SelectTableStoreNames.ACCESS_GRANTS_USERS
                                    : SelectTableStoreNames.ACCESS_GRANTS_PREFIXES
                            }
                        />
                    }
                    tableAriaLabelKey={tableKey}
                />
            </TableHydrator>
        </Box>
    );
}

export default AccessGrantsTable;
