import type { Invoice } from 'src/api/gql/billing';
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

    return (
        <TableRow
            hover
            selected={isSelected}
            onClick={() => onSelectInvoice(invoiceId(row))}
            sx={{ cursor: 'pointer' }}
        >
            <TimeStamp
                date={row.dateStart}
                asLink
                tooltipMessageId="admin.billing.table.history.tooltip.date_start"
            />
            <TimeStamp
                date={row.dateEnd}
                asLink
                tooltipMessageId="admin.billing.table.history.tooltip.date_end"
            />

            <DataVolume volumeInGB={row.extra?.processed_data_gb ?? 0} />

            <TableCell>
                <Typography>
                    {taskUsage} {taskUsage === 1 ? 'Hour' : 'Hours'}
                </Typography>
            </TableCell>

            <MonetaryValue amount={row.subtotal} />
        </TableRow>
    );
}

function Rows({ data, selectedInvoice, onSelectInvoice }: RowsProps) {
    return (
        <>
            {data.map((record, index) => (
                <Row
                    row={record}
                    key={index}
                    isSelected={invoiceId(record) === selectedInvoice}
                    onSelectInvoice={onSelectInvoice}
                />
            ))}
        </>
    );
}

export default Rows;
