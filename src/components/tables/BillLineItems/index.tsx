import type { TableColumns } from 'src/types';

import { useMemo } from 'react';

import {
    Box,
    Button,
    Table,
    TableContainer,
    tableRowClasses,
} from '@mui/material';

import { CreditCard, Download } from 'iconoir-react';

import { INVOICE_ROW_HEIGHT } from 'src/components/admin/Billing/shared';
import Rows from 'src/components/tables/BillLineItems/Rows';
import TotalLines from 'src/components/tables/BillLineItems/TotalLines';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { getTableHeaderWithoutHeaderColor } from 'src/context/Theme';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import { TableStatuses } from 'src/types';

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
    const { invoices, selectedInvoice, isLoading } = useBillingInvoices();

    const dataRows = useMemo(
        () => <Rows lineItems={selectedInvoice?.line_items ?? []} />,
        [selectedInvoice]
    );

    // Whether the selected invoice has any Stripe artifact (PDF, hosted page,
    // receipt, or a status). When it has none, there's nothing to download or
    // pay, so we show a single "No invoice available" button instead.
    const hasInvoiceArtifact = Boolean(
        selectedInvoice &&
            (selectedInvoice.invoice_pdf ||
                selectedInvoice.hosted_invoice_url ||
                selectedInvoice.receipt_url ||
                selectedInvoice.status)
    );

    return (
        <>
            <TableContainer component={Box}>
                <Table
                    aria-label="Invoice Details"
                    size="small"
                    stickyHeader
                    sx={{
                        ...getTableHeaderWithoutHeaderColor(),
                        minWidth: 350,
                        [`& .${tableRowClasses.root}`]: {
                            height: INVOICE_ROW_HEIGHT,
                        },
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
                        loading={isLoading}
                        rows={dataRows}
                    />
                </Table>
            </TableContainer>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexGrow: 1,
                    alignItems: 'end',
                }}
            >
                {selectedInvoice &&
                selectedInvoice.invoice_type !== 'preview' ? (
                    hasInvoiceArtifact ? (
                        <Box>
                            <Button
                                component="a"
                                href={selectedInvoice.invoice_pdf ?? undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                                disabled={!selectedInvoice.invoice_pdf}
                                startIcon={<Download />}
                                variant="outlined"
                                size="small"
                            >
                                Invoice
                            </Button>
                            {selectedInvoice.receipt_url ? (
                                <Button
                                    component="a"
                                    href={selectedInvoice.receipt_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<CreditCard />}
                                    sx={{ marginLeft: 1 }}
                                    variant="outlined"
                                    size="small"
                                >
                                    Receipt
                                </Button>
                            ) : selectedInvoice.status === 'open' ? (
                                <Button
                                    component="a"
                                    href={
                                        selectedInvoice.hosted_invoice_url ??
                                        undefined
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<CreditCard />}
                                    sx={{ marginLeft: 1 }}
                                    variant="outlined"
                                    size="small"
                                >
                                    Pay Invoice
                                </Button>
                            ) : selectedInvoice.status === 'paid' ? (
                                <Button
                                    startIcon={<CreditCard />}
                                    disabled
                                    sx={{ marginLeft: 1 }}
                                    variant="outlined"
                                    size="small"
                                >
                                    Invoice Paid
                                </Button>
                            ) : (
                                <Button
                                    startIcon={<CreditCard />}
                                    disabled
                                    sx={{ marginLeft: 1 }}
                                    variant="outlined"
                                    size="small"
                                >
                                    Pay Invoice
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <Button disabled variant="outlined" size="small">
                            No invoice available
                        </Button>
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
