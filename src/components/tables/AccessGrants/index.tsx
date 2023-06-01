import { Box, Button } from '@mui/material';
import { getGrants, getGrants_Users } from 'api/combinedGrantsExt';
import AccessLinksButton from 'components/tables/AccessGrants/AccessLinks/Dialog/Button';
import Rows, {
    prefixTableColumns,
    userTableColumns,
} from 'components/tables/AccessGrants/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import useTableState, { TablePrefix } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';

interface Props {
    tablePrefix: TablePrefix;
    showUser?: boolean;
}

function AccessGrantsTable({ tablePrefix, showUser }: Props) {
    const {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState(
        tablePrefix,
        showUser ? 'user_full_name' : 'subject_role'
    );

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
                    renderTableRows={(data) => (
                        <Rows data={data} showUser={showUser} />
                    )}
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
                        showUser ? (
                            <AccessLinksButton />
                        ) : (
                            <Button variant="outlined">
                                <FormattedMessage id="admin.prefix.cta.issueGrant" />
                            </Button>
                        )
                    }
                />
            </TableHydrator>
        </Box>
    );
}

export default AccessGrantsTable;
