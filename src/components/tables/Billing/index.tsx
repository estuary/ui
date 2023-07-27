import { Box, Table, TableContainer } from '@mui/material';
import Rows from 'components/tables/Billing/Rows';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBilling_billingHistory,
    useBilling_hydrated,
} from 'stores/Billing/hooks';
import { TableColumns, TableStatuses } from 'types';

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
        field: 'task_usage',
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

// TODO (billing): Use the getStatsForBillingHistoryTable query function as the primary source of data for this view
//   when a database table containing historic billing data is available.
function BillingHistoryTable() {
    const intl = useIntl();

    const hydrated = useBilling_hydrated();
    const billingHistory = useBilling_billingHistory();

    const dataRows = useMemo(
        () =>
            billingHistory.length > 0 ? <Rows data={billingHistory} /> : null,
        [billingHistory]
    );

    return (
        <TableContainer component={Box}>
            <Table
                aria-label={intl.formatMessage({
                    id: 'entityTable.title',
                })}
                size="small"
                sx={{ minWidth: 350 }}
            >
                <EntityTableHeader columns={columns} noBackgroundColor />

                <EntityTableBody
                    columns={columns}
                    noExistingDataContentIds={{
                        header: 'admin.billing.table.history.emptyTableDefault.header',
                        message:
                            'admin.billing.table.history.emptyTableDefault.message',
                        disableDoclink: true,
                    }}
                    tableState={
                        billingHistory.length > 0
                            ? { status: TableStatuses.DATA_FETCHED }
                            : { status: TableStatuses.NO_EXISTING_DATA }
                    }
                    loading={!hydrated}
                    rows={dataRows}
                />
            </Table>
        </TableContainer>
    );
}

export default BillingHistoryTable;
