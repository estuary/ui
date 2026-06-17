import type { Invoice } from 'src/api/billing';
import type { InvoiceId } from 'src/utils/billing-utils';

import { TableCell, TableRow, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import TimeStamp from 'src/components/tables/cells/billing/TimeStamp';
import MonetaryValue from 'src/components/tables/cells/MonetaryValue';
import { useBillingStore } from 'src/stores/Billing';
import { invoiceId } from 'src/utils/billing-utils';

interface RowProps {
    row: Invoice;
    isSelected: boolean;
}

interface RowsProps {
    data: Invoice[];
    selectedInvoice: InvoiceId | null;
}

function Row({ row, isSelected }: RowProps) {
    const setSelectedInvoice = useBillingStore(
        (state) => state.setSelectedInvoice
    );

    return (
        <TableRow
            hover
            selected={isSelected}
            onClick={() => setSelectedInvoice(invoiceId(row))}
            sx={{ cursor: 'pointer' }}
        >
            <TimeStamp
                date={row.date_end}
                asLink
                tooltipMessageId="admin.billing.table.history.tooltip.date_end"
            />

            <TableCell>
                <Typography>
                    <FormattedMessage
                        id="admin.billing.table.history.value.usage"
                        values={{
                            volume: (
                                row.extra?.processed_data_gb ?? 0
                            ).toFixed(1),
                            tasks: row.extra?.task_usage_hours ?? 0,
                        }}
                    />
                </Typography>
            </TableCell>

            <MonetaryValue amount={row.subtotal} />
        </TableRow>
    );
}

function Rows({ data, selectedInvoice }: RowsProps) {
    return (
        <>
            {data.map((record, index) => (
                <Row
                    row={record}
                    key={index}
                    isSelected={invoiceId(record) === selectedInvoice}
                />
            ))}
        </>
    );
}

export default Rows;
