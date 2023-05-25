import { Box } from '@mui/material';
import { getStatsForBillingHistoryTable } from 'api/stats';
import Rows from 'components/tables/Billing/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { useBilling_selectedTenant } from 'stores/Billing/hooks';
import { SelectTableStoreNames } from 'stores/names';
import BillingHistoryTableHydrator from 'stores/Tables/Billing/Hydrator';
import useTableState from 'stores/Tables/hooks';
import { TableColumns } from 'types';

// TODO: Determine if the details table column is necessary and, if so,
//   what data should be displayed in that column. My proposition is that
//   the tier evaluation for that month should be identified in that column.
export const columns: TableColumns[] = [
    {
        field: 'month',
        headerIntlKey: 'admin.billing.table.history.label.month',
    },
    {
        field: 'data_volume',
        headerIntlKey: 'admin.billing.table.history.label.dataVolume',
    },
    {
        field: 'task_count',
        headerIntlKey: 'admin.billing.table.history.label.tasks',
    },
    {
        field: 'details',
        headerIntlKey: 'admin.billing.table.history.label.details',
    },
    {
        field: 'total_cost',
        headerIntlKey: 'admin.billing.table.history.label.totalCost',
    },
];

const selectableTableStoreName = SelectTableStoreNames.BILLING;

// TODO (billing): Enable pagination when the new RPC is available.
function BillingHistoryTable() {
    const selectedTenant = useBilling_selectedTenant();

    const {
        pagination,
        setPagination,
        searchQuery,
        setSearchQuery,
        sortDirection,
        setSortDirection,
        columnToSort,
        setColumnToSort,
    } = useTableState('bil', 'ts', 'desc', 4);

    const query = useMemo(() => {
        return getStatsForBillingHistoryTable([selectedTenant], searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, selectedTenant, searchQuery, sortDirection]);

    const headerKey = 'accessGrantsTable.prefixes.title';
    const filterKey = 'accessGrantsTable.prefixes.filterLabel';

    return (
        <Box>
            <BillingHistoryTableHydrator query={query}>
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'admin.billing.table.history.emptyTableDefault.header',
                        message:
                            'admin.billing.table.history.emptyTableDefault.message',
                        disableDoclink: true,
                    }}
                    columns={columns}
                    renderTableRows={(data) => <Rows data={data} />}
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
                    hideHeaderAndFooter={true}
                    rowsPerPageOptions={[4, 6, 12]}
                    minWidth={500}
                />
            </BillingHistoryTableHydrator>
        </Box>
    );
}

export default BillingHistoryTable;
