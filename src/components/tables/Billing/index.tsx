import type { TableColumns } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import { Box, Table, TableContainer, TablePagination } from '@mui/material';

import Rows from 'src/components/tables/Billing/Rows';
import EntityTableBody from 'src/components/tables/EntityTable/TableBody';
import EntityTableHeader from 'src/components/tables/EntityTable/TableHeader';
import TablePaginationActions from 'src/components/tables/PaginationActions';
import { getTableHeaderWithoutHeaderColor } from 'src/context/Theme';
import { useBillingInvoices } from 'src/hooks/billing/useBillingInvoices';
import { TableStatuses } from 'src/types';
import { invoiceId } from 'src/utils/billing-utils';

export const columns: TableColumns[] = [
    {
        field: 'date_end',
        headerIntlKey: 'admin.billing.table.history.label.date_end',
    },
    {
        field: 'usage',
        headerIntlKey: 'admin.billing.table.history.label.usage',
    },
    {
        field: 'total_cost',
        headerIntlKey: 'admin.billing.table.history.label.totalCost',
        align: 'right',
    },
];

const ROWS_PER_PAGE = 4;

function BillingHistoryTable() {
    const {
        allInvoices,
        selectedInvoice,
        isLoading,
        networkFailed,
        selectedTenant,
    } = useBillingInvoices();

    const [page, setPage] = useState(0);

    // Return to the first (newest) page when the tenant changes, so a tenant
    // switch starts at the top; refreshes within the same tenant keep the
    // current page. The currentPage clamp below keeps the view in range when
    // the invoice count changes.
    useEffect(() => {
        setPage(0);
    }, [selectedTenant]);

    const pageCount = Math.ceil(allInvoices.length / ROWS_PER_PAGE);
    const currentPage = Math.min(page, Math.max(0, pageCount - 1));

    const dataRows = useMemo(() => {
        if (allInvoices.length === 0) {
            return null;
        }

        const start = currentPage * ROWS_PER_PAGE;

        return (
            <Rows
                data={allInvoices.slice(start, start + ROWS_PER_PAGE)}
                selectedInvoice={
                    selectedInvoice ? invoiceId(selectedInvoice) : null
                }
            />
        );
    }, [allInvoices, currentPage, selectedInvoice]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <TableContainer component={Box}>
                <Table
                    aria-label="Entity Table"
                    size="small"
                    sx={{ ...getTableHeaderWithoutHeaderColor() }}
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
                            allInvoices.length > 0
                                ? { status: TableStatuses.DATA_FETCHED }
                                : networkFailed
                                  ? { status: TableStatuses.NETWORK_FAILED }
                                  : { status: TableStatuses.NO_EXISTING_DATA }
                        }
                        loading={isLoading}
                        rows={dataRows}
                    />
                </Table>
            </TableContainer>

            {allInvoices.length > ROWS_PER_PAGE ? (
                <TablePagination
                    component="div"
                    count={allInvoices.length}
                    page={currentPage}
                    rowsPerPage={ROWS_PER_PAGE}
                    rowsPerPageOptions={[]}
                    onPageChange={(_event, newPage) => setPage(newPage)}
                    ActionsComponent={TablePaginationActions}
                    sx={{ mt: 'auto' }}
                />
            ) : null}
        </Box>
    );
}

export default BillingHistoryTable;
