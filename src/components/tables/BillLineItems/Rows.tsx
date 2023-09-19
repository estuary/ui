import { TableCell, TableRow, Typography } from '@mui/material';
import { InvoiceLineItem } from 'api/billing';
import MonetaryValue from 'components/tables/cells/MonetaryValue';

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
            <TableCell>
                <Typography>{row.count}</Typography>
            </TableCell>

            <MonetaryValue amount={row.rate / 100} />
            <MonetaryValue amount={row.subtotal / 100} />
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
