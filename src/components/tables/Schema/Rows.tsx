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

    // We only do special sorting for name - otherwise we can use lodash
    if (columnToSort === 'name') {
        return (
            <>
                {data
                    .sort((first: any, second: any) => {
                        // Fetch the fields we want to sort
                        const a = first[columnToSort];
                        const b = second[columnToSort];

                        // See if the values start with alphanumeric
                        const aIsAlphabetical = a.localeCompare('a') >= 0;
                        const bIsAlphabetical = b.localeCompare('a') >= 0;

                        if (!aIsAlphabetical && bIsAlphabetical) {
                            return 1;
                        }

                        if (aIsAlphabetical && !bIsAlphabetical) {
                            return -1;
                        }

                        if (sortDirection === 'asc') {
                            return a.localeCompare(b);
                        }

                        return b.localeCompare(a);
                    })
                    .map((record: any, index: number) => (
                        <Row row={record} key={`schema-table-rows-${index}`} />
                    ))}
            </>
        );
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
