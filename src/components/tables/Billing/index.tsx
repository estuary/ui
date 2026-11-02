import type { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import type { TableColumns } from 'src/types';
import type { InvoiceId } from 'src/utils/billing-utils';

import { useMemo } from 'react';

import {
    Box,
    Table,
    TableContainer,
    TableFooter,
    TablePagination,
    TableRow,
} from '@mui/material';

import { BILLING_HISTORY_PAGE_SIZE } from 'src/api/gql/billing';
import Rows from 'src/components/tables/Billing/Rows';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import { getTableHeaderWithoutHeaderColor } from 'src/context/Theme';
import { TableStatuses } from 'src/types';

interface BillingHistoryTableProps {
    history: ReturnType<typeof useBillingInvoices>;
    selectedInvoiceId: InvoiceId | null;
    onSelectInvoice: (id: InvoiceId) => void;
}

const columns: TableColumns[] = [
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

function BillingHistoryTable({
    history,
    selectedInvoiceId,
    onSelectInvoice,
}: BillingHistoryTableProps) {
    const {
        invoices: billingHistory,
        page,
        hasNextPage,
        onPageChange,
        isLoading,
    } = history;

    const dataRows = useMemo(
        () =>
            billingHistory.length > 0 ? (
                <Rows
                    data={billingHistory}
                    selectedInvoice={selectedInvoiceId}
                    onSelectInvoice={onSelectInvoice}
                />
            ) : null,
        [billingHistory, selectedInvoiceId, onSelectInvoice]
    );

    return (
        <TableContainer component={Box}>
            <Table
                aria-label="Entity Table"
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
                            : { status: TableStatuses.NO_EXISTING_DATA }
                    }
                    loading={isLoading}
                    rows={dataRows}
                />

                {page > 0 || hasNextPage ? (
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                // Unknown until the last page.
                                count={
                                    hasNextPage || isLoading
                                        ? -1
                                        : page * BILLING_HISTORY_PAGE_SIZE +
                                          billingHistory.length
                                }
                                page={page}
                                rowsPerPage={BILLING_HISTORY_PAGE_SIZE}
                                rowsPerPageOptions={[]}
                                onPageChange={onPageChange}
                                // A page's cursor is only known once it loads.
                                disabled={isLoading}
                            />
                        </TableRow>
                    </TableFooter>
                ) : null}
            </Table>
        </TableContainer>
    );
}

export default BillingHistoryTable;
