import { TableCell, TableRow, Typography } from '@mui/material';
import { orderBy } from 'lodash';
import { Schema, SortDirection } from 'types';
import ChipList from '../cells/ChipList';

interface RowProps {
    row: any;
}

interface RowsProps {
    data: Schema | null;
    sortDirection: SortDirection;
    columnToSort: string;
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

            <ChipList strings={row.types} stripPath={false} />

            <TableCell>
                <Typography>{row.exists}</Typography>
            </TableCell>
        </TableRow>
    );
}

function Rows({ data, sortDirection, columnToSort }: RowsProps) {
    if (!data) {
        return null;
    }

    return (
        <>
            {orderBy(data, [columnToSort], [sortDirection]).map(
                (record: any, index: number) => (
                    <Row row={record} key={`schema-table-rows-${index}`} />
                )
            )}
        </>
    );
}

export default Rows;
