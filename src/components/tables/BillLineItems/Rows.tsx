import type { InvoiceLineItem } from 'src/api/billing';

import { TableCell, TableRow, Typography } from '@mui/material';

import MonetaryValue from 'src/components/tables/cells/MonetaryValue';

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
