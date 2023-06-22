import { TableCell, TableRow, Typography } from '@mui/material';
import { orderBy } from 'lodash';
import { InferDetails, Schema, SortDirection } from 'types';
import ChipList from '../cells/ChipList';

interface RowProps {
    row: InferDetails;
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
                    .sort((first: InferDetails, second: InferDetails) => {
                        // Try fetching the name and if it isn't there then set to empty string
                        const a = first.name ?? '';
                        const b = second.name ?? '';

                        // See if the values start with alphanumeric
                        const aIsAlphabetical = a.localeCompare('a') >= 0;
                        const bIsAlphabetical = b.localeCompare('a') >= 0;

                        // If a is alpha and b isn't then return >0 to put b first
                        if (!aIsAlphabetical && bIsAlphabetical) {
                            return 1;
                        }

                        // If a is alpha and b isn't then return <0 to put a first
                        if (aIsAlphabetical && !bIsAlphabetical) {
                            return -1;
                        }

                        // When ascending we want to compare a to b
                        if (sortDirection === 'asc') {
                            return a.localeCompare(b);
                        }

                        // Otherwise we're descending and need to flip the comparison order
                        return b.localeCompare(a);
                    })
                    .map((record: InferDetails, index: number) => (
                        <Row row={record} key={`schema-table-rows-${index}`} />
                    ))}
            </>
        );
    }

    return (
        <>
            {orderBy(data, [columnToSort], [sortDirection]).map(
                (record, index) => (
                    <Row row={record} key={`schema-table-rows-${index}`} />
                )
            )}
        </>
    );
}

export default Rows;
