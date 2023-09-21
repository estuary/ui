import { TableCell, TableRow, Typography } from '@mui/material';
import { Invoice } from 'api/billing';
import MonetaryValue from 'components/tables/cells/MonetaryValue';
import DataVolume from 'components/tables/cells/billing/DataVolume';
import TimeStamp from 'components/tables/cells/billing/TimeStamp';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBilling_setSelectedInvoice } from 'stores/Billing/hooks';
import { InvoiceId, invoiceId } from 'utils/billing-utils';

interface RowProps {
    row: Invoice;
    isSelected: boolean;
}

interface RowsProps {
    data: Invoice[];
    selectedInvoice: InvoiceId | null;
}

function Row({ row, isSelected }: RowProps) {
    const setSelectedInvoice = useBilling_setSelectedInvoice();
    return (
        <TableRow
            hover
            selected={isSelected}
            onClick={() => setSelectedInvoice(invoiceId(row))}
            sx={{ cursor: 'pointer' }}
        >
            <TimeStamp
                date={row.date_start}
                asLink
                tooltipMessageId="admin.billing.table.history.tooltip.date_start"
            />
            <TimeStamp
                date={row.date_end}
                asLink
                tooltipMessageId="admin.billing.table.history.tooltip.date_end"
            />

            <DataVolume volumeInGB={row.extra?.processed_data_gb ?? 0} />

            <TableCell>
                <Typography>
                    <FormattedMessage
                        id="admin.billing.graph.taskHoursByMonth.formatValue"
                        values={{ taskUsage: row.extra?.task_usage_hours ?? 0 }}
                    />
                </Typography>
            </TableCell>

            <MonetaryValue amount={row.subtotal / 100} />
        </TableRow>
    );
}

// TODO (billing): Remove pagination placeholder when the new RPC is available.
function Rows({ data, selectedInvoice }: RowsProps) {
    // The table should only show the four, most recent months of billing history.
    // If the user has accrued more than four months worth of billing data, calculate
    // the adjusted start index.
    const startIndex = useMemo(
        () => (data.length > 4 ? data.length - 4 : 0),
        [data.length]
    );

    return (
        <>
            {data
                .slice(startIndex, data.length)
                .reverse()
                .map((record, index) => (
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
