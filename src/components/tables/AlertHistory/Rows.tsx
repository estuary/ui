import type { TableColumns } from 'src/types';

import { TableCell, TableRow, useTheme } from '@mui/material';

import { getEntityTableRowSx } from 'src/context/Theme';

interface RowsProps {
    columns: TableColumns[];
    data: any;
}

interface RowProps {
    row: any;
}

function Row({ row }: RowProps) {
    const theme = useTheme();

    return (
        <TableRow hover sx={getEntityTableRowSx(theme)}>
            <TableCell>{row.catalogName}</TableCell>
            <TableCell>{row.firedAt}</TableCell>
            <TableCell>{row.resolvedAt}</TableCell>
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row: any) => (
                <Row key={row} row={row} />
            ))}
        </>
    );
}

export default Rows;
