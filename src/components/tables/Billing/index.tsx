import { Box } from '@mui/material';
import { getStatsForBillingHistoryTable } from 'api/stats';
import Rows from 'components/tables/Billing/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import BillingHistoryTableHydrator from 'stores/Tables/Billing/Hydrator';
import useTableState from 'stores/Tables/hooks';
import { Grants, TableColumns } from 'types';

interface Props {
    grants: Grants[];
}

// TODO: Determine if the details table column is necessary and, if so,
//   what data should be displayed in that column. My proposition is that
//   the tier evaluation for that month should be identified in that column.
export const columns: TableColumns[] = [
    {
        field: 'month',
        headerIntlKey: 'admin.billing.projectedCostTable.label.month',
    },
    {
        field: 'data_volume',
        headerIntlKey: 'admin.billing.projectedCostTable.label.dataVolume',
    },
    {
        field: 'task_count',
        headerIntlKey: 'admin.billing.projectedCostTable.label.tasks',
    },
    {
        field: 'details',
        headerIntlKey: 'admin.billing.projectedCostTable.label.details',
    },
    {
        field: 'total_cost',
        headerIntlKey: 'admin.billing.projectedCostTable.label.totalCost',
    },
];

const selectableTableStoreName = SelectTableStoreNames.BILLING;

// TODO (billing): Enable pagination when the new RPC is available.
function ProjectedCostsTable({ grants }: Props) {
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
        return getStatsForBillingHistoryTable(grants, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, grants, searchQuery, sortDirection]);

    const headerKey = 'accessGrantsTable.prefixes.title';
    const filterKey = 'accessGrantsTable.prefixes.filterLabel';

    return (
        <Box>
            <BillingHistoryTableHydrator query={query}>
                <EntityTable
                    noExistingDataContentIds={{
                        header: 'admin.billing.projectedCostTable.emptyTableDefault.header',
                        message:
                            'admin.billing.projectedCostTable.emptyTableDefault.message',
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

export default ProjectedCostsTable;
