import { Box, IconButton, Table, TableContainer, Tooltip } from '@mui/material';
import { StripeInvoice, getTenantInvoice } from 'api/billing';
import Rows from 'components/tables/BillLineItems/Rows';
import TotalLines from 'components/tables/BillLineItems/TotalLines';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { CreditCard, DoubleCheck, Download } from 'iconoir-react';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useBilling_billingHistory,
    useBilling_hydrated,
    useBilling_selectedMonth,
    useBilling_selectedTenant,
} from 'stores/Billing/hooks';
import { TableColumns, TableStatuses } from 'types';

export const columns: TableColumns[] = [
    {
        field: 'description',
        headerIntlKey: 'admin.billing.table.line_items.label.description',
    },
    {
        field: 'count',
        headerIntlKey: 'admin.billing.table.line_items.label.count',
    },
    {
        field: 'rate',
        headerIntlKey: 'admin.billing.table.line_items.label.rate',
        align: 'right',
    },
    {
        field: 'subtotal',
        headerIntlKey: 'admin.billing.table.line_items.label.subtotal',
        align: 'right',
    },
];

// TODO (billing): Use the getStatsForBillingHistoryTable query function as the primary source of data for this view
//   when a database table containing historic billing data is available.
function BillingLineItemsTable() {
    const intl = useIntl();

    const selectedTenant = useBilling_selectedTenant();
    const selectedMonth = useBilling_selectedMonth();

    const hydrated = useBilling_hydrated();
    const billingHistory = useBilling_billingHistory();

    const billedMonth = useMemo(
        () =>
            billingHistory.find((bill) => bill.billed_month === selectedMonth),
        [billingHistory, selectedMonth]
    );

    const dataRows = useMemo(
        () => <Rows lineItems={billedMonth?.line_items ?? []} />,
        [billedMonth]
    );

    const [stripeInvoice, setStripeInvoice] = useState<StripeInvoice | null>(
        null
    );

    useEffect(() => {
        setStripeInvoice(null);
        void (async () => {
            const resp = await getTenantInvoice(
                selectedTenant,
                selectedMonth,
                'Usage'
            );
            if (resp.data?.invoice) {
                setStripeInvoice(resp.data.invoice);
            }
        })();
    }, [selectedMonth, selectedTenant]);

    return (
        <>
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
                            header: 'admin.billing.table.line_items.emptyTableDefault.header',
                            message:
                                'admin.billing.table.line_items.emptyTableDefault.message',
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 2,
                    flexGrow: 1,
                    alignItems: 'end',
                }}
            >
                {stripeInvoice ? (
                    <Box>
                        <Tooltip title="Download invoice PDF">
                            <IconButton href={stripeInvoice.invoice_pdf}>
                                <Download />
                            </IconButton>
                        </Tooltip>
                        {stripeInvoice.status === 'open' ? (
                            <Tooltip title="Pay invoice">
                                <IconButton
                                    href={stripeInvoice.hosted_invoice_url}
                                >
                                    <CreditCard />
                                </IconButton>
                            </Tooltip>
                        ) : stripeInvoice.status === 'paid' ? (
                            <Tooltip title="Invoice paid">
                                <span>
                                    <IconButton disabled>
                                        <DoubleCheck />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        ) : null}
                    </Box>
                ) : null}
                <Box sx={{ flexGrow: 1 }} />
                {billedMonth ? <TotalLines bill={billedMonth} /> : null}
            </Box>
        </>
    );
}

export default BillingLineItemsTable;
