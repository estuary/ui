import { Box } from '@mui/material';
import { getDirectivesByType } from 'api/directives';
import Rows from 'components/tables/AccessGrants/AccessLinks/Rows';
import EntityTable from 'components/tables/EntityTable';
import RowSelector from 'components/tables/RowActions/AccessLinks/RowSelector';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import { useTableState } from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
import { TableColumns } from 'types';

export const columns: TableColumns[] = [
    {
        field: null,
        headerIntlKey: '',
    },
    {
        field: 'provisioning_prefix',
        headerIntlKey:
            'accessGrants.table.accessLinks.label.provisioningPrefix',
    },
    {
        field: 'granted_prefix',
        headerIntlKey: 'accessGrants.table.accessLinks.label.grantedPrefix',
    },
    {
        field: 'capability',
        headerIntlKey: 'accessGrants.table.accessLinks.label.capability',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'accessGrants.table.accessLinks.label.lastUpdated',
    },
    {
        field: null,
        headerIntlKey: '',
    },
];

const selectableTableStoreName = SelectTableStoreNames.ACCESS_GRANTS_LINKS;

function AccessLinksTable() {
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
    } = useTableState('ali', 'updated_at', 'desc');

    const query = useMemo(() => {
        return getDirectivesByType('grant', pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, pagination, searchQuery, sortDirection]);

    const headerKey = 'accessGrants.table.accessLinks.title';
    const filterKey = 'accessGrants.table.accessLinks.label.filter';

    return (
        <Box>
            <TableHydrator
                disableQueryParamHack
                query={query}
                selectableTableStoreName={selectableTableStoreName}
            >
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'accessGrants.table.accessLinks.header.noData',
                        message:
                            'accessGrants.table.accessLinks.message.noData',
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
                    header={headerKey}
                    filterLabel={filterKey}
                    selectableTableStoreName={selectableTableStoreName}
                    showToolbar
                    toolbar={<RowSelector />}
                />
            </TableHydrator>
        </Box>
    );
}

export default AccessLinksTable;
