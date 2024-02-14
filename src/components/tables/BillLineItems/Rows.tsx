import { TableCell, TableRow, Typography } from '@mui/material';
import { InvoiceLineItem } from 'api/billing';
import MonetaryValue from 'components/tables/cells/MonetaryValue';
import { FormattedMessage } from 'react-intl';
import DataVolume from '../cells/billing/DataVolume';

interface RowProps {
    row: InvoiceLineItem;
}

interface RowsProps {
    lineItems: InvoiceLineItem[];
}

function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TableCell>
                <Typography>{row.description}</Typography>
            </TableCell>

            {row.description.includes('Data processing') ? (
                <DataVolume volumeInGB={row.count} />
            ) : row.description.includes('Task usage') ? (
                <TableCell>
                    <Typography>
                        <FormattedMessage
                            id="admin.billing.table.line_items.count.taskUsage.formatValue"
                            values={{ taskUsage: row.count }}
                        />
                    </Typography>
                </TableCell>
            ) : (
                <TableCell>{row.count}</TableCell>
            )}

            <MonetaryValue amount={row.rate} />
            <MonetaryValue amount={row.subtotal} />
        </TableRow>
    );
}

function Rows({ lineItems }: RowsProps) {
    return (
        <>
            {lineItems.map((record, index) => (
                <Row row={record} key={index} />
            ))}
        </>
    );
}

export default Rows;
