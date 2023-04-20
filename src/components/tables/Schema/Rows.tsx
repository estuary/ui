import { TableCell, TableRow, Typography } from '@mui/material';
import MonetaryValue from 'components/tables/cells/MonetaryValue';

interface RowProps {
    row: any;
}

interface RowsProps {
    data?: any[];
}

function Row({ row }: RowProps) {
    return (
        <TableRow hover>
            <TableCell>
                <Typography>{row.name}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.pointer}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.types}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.exists}</Typography>
            </TableCell>

            <MonetaryValue amount={row.totalCost} />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    if (!data) {
        return null;
    }

    return (
        <>
            {data.map((record, index) => (
                <Row row={record} key={index} />
            ))}
        </>
    );
}

export default Rows;
