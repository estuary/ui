import { TableCell, TableRow } from '@mui/material';

import TimeStamp from 'components/tables/cells/TimeStamp';

interface RowProps {
    row: any;
}

interface RowsProps {
    data: any[];
}

export const prefixTableColumns = [
    {
        field: 'object_role',
        headerIntlKey: 'entityTable.data.sharedPrefix',
    },
    {
        field: 'subject_role',
        headerIntlKey: 'entityTable.data.sharedWith',
    },
    {
        field: 'capability',
        headerIntlKey: 'entityTable.data.capability',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
];

function Row({ row }: RowProps) {
    return (
        <TableRow key={`Entity-${row.id}`}>
            <TableCell>{row.object_role}</TableCell>

            {row.subject_role ? (
                <TableCell>{row.subject_role}</TableCell>
            ) : (
                <TableCell> </TableCell>
            )}

            <TableCell>{row.capability}</TableCell>

            <TimeStamp time={row.updated_at} enableRelative />
        </TableRow>
    );
}

function PrefixRows({ data }: RowsProps) {
    return (
        <>
            {data.map((row) => {
                return <Row row={row} key={row.id} />;
            })}
        </>
    );
}

export default PrefixRows;
