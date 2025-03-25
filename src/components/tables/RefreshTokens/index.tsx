import { getRefreshTokensForTable } from 'api/tokens';
import ConfigureRefreshTokenButton from 'components/admin/Api/RefreshToken/ConfigureTokenButton';
import EntityTable from 'components/tables/EntityTable';
import Rows from 'components/tables/RefreshTokens/Rows';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { TablePrefixes, useTableState } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import type { TableColumns } from 'types';

const columns: TableColumns[] = [
    {
        field: 'created_at',
        headerIntlKey: 'entityTable.data.created',
    },
    {
        field: 'detail',
        headerIntlKey: 'entityTable.data.description',
    },
    {
        field: 'uses',
        headerIntlKey: 'entityTable.data.status',
    },
    {
        field: null,
        width: 125,
    },
];

const selectableTableStoreName = SelectTableStoreNames.REFRESH_TOKENS;

function RefreshTokenTable() {
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
    } = useTableState(TablePrefixes.refreshTokens, 'created_at', 'desc');

    const query = useMemo(() => {
        return getRefreshTokensForTable(pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    return (
        <TableHydrator
            query={query}
            selectableTableStoreName={selectableTableStoreName}
        >
            <EntityTable
                noExistingDataContentIds={{
                    header: 'admin.cli_api.refreshToken.table.noContent.header',
                    message:
                        'admin.cli_api.refreshToken.table.noContent.message',
                    disableDoclink: true,
                }}
                columns={columns}
                renderTableRows={(data) => <Rows data={data} />}
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
                header={null}
                filterLabel="admin.cli_api.refreshToken.table.filterLabel"
                selectableTableStoreName={selectableTableStoreName}
                showToolbar
                toolbar={<ConfigureRefreshTokenButton />}
            />
        </TableHydrator>
    );
}

export default RefreshTokenTable;
