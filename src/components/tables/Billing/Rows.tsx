import type { Invoice } from 'src/api/billing';
import type { InvoiceId } from 'src/utils/billing-utils';

import { TableCell, TableRow, Typography } from '@mui/material';

import DataVolume from 'src/components/tables/cells/billing/DataVolume';
import TimeStamp from 'src/components/tables/cells/billing/TimeStamp';
import MonetaryValue from 'src/components/tables/cells/MonetaryValue';
import { invoiceId } from 'src/utils/billing-utils';

interface RowProps {
    row: Invoice;
    isSelected: boolean;
    onSelectInvoice: (id: InvoiceId) => void;
}

interface RowsProps {
    data: Invoice[];
    selectedInvoice: InvoiceId | null;
    onSelectInvoice: (id: InvoiceId) => void;
}

function Row({ row, isSelected, onSelectInvoice }: RowProps) {
    const taskUsage = row.extra?.task_usage_hours ?? 0;
    const hourLabel =
        new Intl.PluralRules(navigator.language || 'en-US').select(
            taskUsage
        ) === 'one'
            ? 'Hour'
            : 'Hours';

    return (
        <TableRow
            hover
            selected={isSelected}
            onClick={() => onSelectInvoice(invoiceId(row))}
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
                <Typography>{`${taskUsage} ${hourLabel}`}</Typography>
            </TableCell>

            <MonetaryValue amount={row.subtotal} />
        </TableRow>
    );
}

// TODO (billing): Remove pagination placeholder when the new RPC is available.
function Rows({ data, selectedInvoice, onSelectInvoice }: RowsProps) {
    return (
        <>
            {data.slice(0, 4).map((record) => (
                <Row
                    row={record}
                    key={invoiceId(record)}
                    isSelected={invoiceId(record) === selectedInvoice}
                    onSelectInvoice={onSelectInvoice}
                />
            ))}
        </>
    );
}

export default Rows;
