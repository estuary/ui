import type { Invoice } from 'src/api/billing';
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
import { TableStatuses } from 'src/types';

const columns: TableColumns[] = [
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

interface BillingLineItemsTableProps {
    selectedInvoice: Invoice | null;
}

function BillingLineItemsTable({
    selectedInvoice,
}: BillingLineItemsTableProps) {
    const dataRows = useMemo(
        () => <Rows lineItems={selectedInvoice?.line_items ?? []} />,
        [selectedInvoice]
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
                            selectedInvoice
                                ? { status: TableStatuses.DATA_FETCHED }
                                : { status: TableStatuses.NO_EXISTING_DATA }
                        }
                        loading={false}
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
                    <Box>
                        <Button
                            href={selectedInvoice?.invoice_pdf ?? undefined}
                            disabled={!selectedInvoice?.invoice_pdf}
                            startIcon={<Download />}
                            variant="outlined"
                            size="small"
                        >
                            {'Download invoice PDF'}
                        </Button>
                        {selectedInvoice?.status === 'open' ? (
                            <Button
                                href={
                                    selectedInvoice.hosted_invoice_url ??
                                    undefined
                                }
                                startIcon={<CreditCard />}
                                sx={{ marginLeft: 1 }}
                                variant="outlined"
                                size="small"
                            >
                                {'Pay Invoice'}
                            </Button>
                        ) : selectedInvoice?.status === 'paid' ? (
                            <Button
                                startIcon={<CreditCard />}
                                disabled
                                sx={{ marginLeft: 1 }}
                                variant="outlined"
                                size="small"
                            >
                                {'Invoice Paid'}
                            </Button>
                        ) : (
                            <Button
                                startIcon={<CreditCard />}
                                disabled
                                sx={{ marginLeft: 1 }}
                                variant="outlined"
                                size="small"
                            >
                                {'Pay Invoice'}
                            </Button>
                        )}
                    </Box>
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
