import { Box, Table, TableContainer } from '@mui/material';
import Rows from 'components/tables/Billing/Rows';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { getTableHeaderWithoutHeaderColor } from 'context/Theme';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useBillingStore } from 'stores/Billing/Store';
import { useBilling_selectedInvoice } from 'stores/Billing/hooks';
import { TableColumns, TableStatuses } from 'types';
import { invoiceId } from 'utils/billing-utils';

export const columns: TableColumns[] = [
    {
        field: 'date_start',
        headerIntlKey: 'admin.billing.table.history.label.date_start',
    },
    {
        field: 'date_end',
        headerIntlKey: 'admin.billing.table.history.label.date_end',
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
        field: 'total_cost',
        headerIntlKey: 'admin.billing.table.history.label.totalCost',
        align: 'right',
    },
];

// TODO (billing): Use the getStatsForBillingHistoryTable query function as the primary source of data for this view
//   when a database table containing historic billing data is available.
function BillingHistoryTable() {
    const intl = useIntl();

    const selectedInvoice = useBilling_selectedInvoice();

    const active = useBillingStore((state) => state.active);
    const hydrated = useBillingStore((state) => state.hydrated);
    const networkFailed = useBillingStore((state) => state.networkFailed);
    const billingHistory = useBillingStore((state) => state.invoices);

    const dataRows = useMemo(
        () =>
            billingHistory.length > 0 ? (
                <Rows
                    data={billingHistory}
                    selectedInvoice={
                        selectedInvoice ? invoiceId(selectedInvoice) : null
                    }
                />
            ) : null,
        [billingHistory, selectedInvoice]
    );

    return (
        <TableContainer component={Box}>
            <Table
                aria-label={intl.formatMessage({
                    id: 'entityTable.title',
                })}
                size="small"
                sx={{
                    ...getTableHeaderWithoutHeaderColor(),
                    minWidth: 450,
                }}
            >
                <EntityTableHeader columns={columns} />

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
                            : networkFailed
                              ? { status: TableStatuses.NETWORK_FAILED }
                              : { status: TableStatuses.NO_EXISTING_DATA }
                    }
                    loading={Boolean(active || !hydrated)}
                    rows={dataRows}
                />
            </Table>
        </TableContainer>
    );
}

export default BillingHistoryTable;
