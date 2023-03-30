import { Box } from '@mui/material';
import { getStatsForBillingExt } from 'api/stats';
import Rows from 'components/tables/Billing/Rows';
import EntityTable from 'components/tables/EntityTable';
import { useMemo } from 'react';
import { SelectTableStoreNames } from 'stores/names';
import useTableState from 'stores/Tables/hooks';
import TableHydrator from 'stores/Tables/Hydrator';
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
    // {
    //     field: 'details',
    //     headerIntlKey: 'admin.billing.projectedCostTable.label.details',
    // },
    {
        field: 'total_cost',
        headerIntlKey: 'admin.billing.projectedCostTable.label.totalCost',
    },
];

const selectableTableStoreName = SelectTableStoreNames.BILLING;

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
    } = useTableState('bil', 'ts', 'desc');

    // const { combinedGrants } = useCombinedGrantsExt({ adminOnly: true });

    const query = useMemo(() => {
        return getStatsForBillingExt(grants, pagination, searchQuery, [
            {
                col: columnToSort,
                direction: sortDirection,
            },
        ]);
    }, [columnToSort, grants, pagination, searchQuery, sortDirection]);

    const headerKey = 'accessGrantsTable.prefixes.title';
    const filterKey = 'accessGrantsTable.prefixes.filterLabel';

    return (
        <Box>
            <TableHydrator
                query={query}
                selectableTableStoreName={selectableTableStoreName}
            >
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
                    hideHeader={true}
                />
            </TableHydrator>
        </Box>
    );
}

export default ProjectedCostsTable;
