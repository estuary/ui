import { Box, Button, Skeleton, Table, TableContainer } from '@mui/material';
import { StripeInvoice, getTenantInvoice } from 'api/billing';
import Rows from 'components/tables/BillLineItems/Rows';
import TotalLines from 'components/tables/BillLineItems/TotalLines';
import EntityTableBody from 'components/tables/EntityTable/TableBody';
import EntityTableHeader from 'components/tables/EntityTable/TableHeader';
import { getTableHeaderWithoutHeaderColor } from 'context/Theme';
import { useSelectedTenant } from 'context/fetcher/Tenant';
import { CreditCard, Download } from 'iconoir-react';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import {
    useBilling_hydrated,
    useBilling_invoices,
    useBilling_selectedInvoice,
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

    const { selectedTenant } = useSelectedTenant();

    const selectedInvoice = useBilling_selectedInvoice();

    const hydrated = useBilling_hydrated();
    const invoices = useBilling_invoices();

    const dataRows = useMemo(
        () => <Rows lineItems={selectedInvoice?.line_items ?? []} />,
        [selectedInvoice]
    );

    const [stripeInvoice, setStripeInvoice] = useState<StripeInvoice | null>(
        null
    );

    useEffect(() => {
        setStripeInvoice(null);
        void (async () => {
            if (selectedInvoice && selectedInvoice.invoice_type !== 'preview') {
                const resp = await getTenantInvoice(
                    selectedTenant,
                    selectedInvoice.date_start,
                    selectedInvoice.date_end,
                    selectedInvoice.invoice_type
                );
                if (resp.data?.invoice) {
                    setStripeInvoice(resp.data.invoice);
                }
            }
        })();
    }, [selectedInvoice, selectedTenant]);

    return (
        <>
            <TableContainer component={Box}>
                <Table
                    aria-label={intl.formatMessage({
                        id: 'admin.billing.table.line_items.title',
                    })}
                    size="small"
                    stickyHeader
                    sx={{
                        ...getTableHeaderWithoutHeaderColor(),
                        minWidth: 350,
                    }}
                >
                    <EntityTableHeader columns={columns} />

                    <EntityTableBody
                        columns={columns}
                        noExistingDataContentIds={{
                            header: 'admin.billing.table.line_items.emptyTableDefault.header',
                            message:
                                'admin.billing.table.line_items.emptyTableDefault.message',
                            disableDoclink: true,
                        }}
                        tableState={
                            invoices.length > 0
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
                {selectedInvoice?.invoice_type !== 'preview' ? (
                    hydrated ? (
                        <Box>
                            <Button
                                href={stripeInvoice?.invoice_pdf}
                                disabled={!stripeInvoice}
                                startIcon={<Download />}
                                variant="outlined"
                                size="small"
                            >
                                {intl.formatMessage({
                                    id: 'admin.billing.table.line_items.tooltip.download_pdf',
                                })}
                            </Button>
                            {stripeInvoice?.status === 'open' ? (
                                <Button
                                    href={stripeInvoice.hosted_invoice_url}
                                    startIcon={<CreditCard />}
                                    sx={{ marginLeft: 1 }}
                                    variant="outlined"
                                    size="small"
                                >
                                    {intl.formatMessage({
                                        id: 'admin.billing.table.line_items.tooltip.pay_invoice',
                                    })}
                                </Button>
                            ) : stripeInvoice?.status === 'paid' ? (
                                <Button
                                    startIcon={<CreditCard />}
                                    disabled
                                    sx={{ marginLeft: 1 }}
                                    variant="outlined"
                                    size="small"
                                >
                                    {intl.formatMessage({
                                        id: 'admin.billing.table.line_items.tooltip.invoice_paid',
                                    })}
                                </Button>
                            ) : (
                                <Button
                                    startIcon={<CreditCard />}
                                    disabled
                                    sx={{ marginLeft: 1 }}
                                    variant="outlined"
                                    size="small"
                                >
                                    {intl.formatMessage({
                                        id: 'admin.billing.table.line_items.tooltip.pay_invoice',
                                    })}
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <>
                            <Skeleton
                                variant="rectangular"
                                width={200}
                                height={25}
                            />
                            <Skeleton
                                sx={{ marginLeft: 1 }}
                                variant="rectangular"
                                width={120}
                                height={25}
                            />
                        </>
                    )
                ) : null}
                <Box sx={{ flexGrow: 1 }} />
                {selectedInvoice ? (
                    <TotalLines invoice={selectedInvoice} />
                ) : null}
            </Box>
        </>
    );
}

export default BillingLineItemsTable;
