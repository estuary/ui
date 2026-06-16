import type { TableColumns } from 'src/types';

import { useEffect, useMemo, useState } from 'react';

import { Box, Table, TableContainer, TablePagination } from '@mui/material';

import { useIntl } from 'react-intl';

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

const ROWS_PER_PAGE = 4;

function BillingHistoryTable() {
    const intl = useIntl();

    const { allInvoices, selectedInvoice, isLoading, networkFailed } =
        useBillingInvoices();

    const [page, setPage] = useState(0);

    // The selected tenant lives behind the hook; reset to the first (newest)
    // page whenever the invoice set changes so a tenant switch starts at the
    // top rather than stranding the view on a now-out-of-range page.
    useEffect(() => {
        setPage(0);
    }, [allInvoices]);

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
        <Box>
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
                />
            ) : null}
        </Box>
    );
}

export default BillingHistoryTable;
