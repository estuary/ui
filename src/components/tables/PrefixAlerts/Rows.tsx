import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';

function Row({ row }: RowProps) {
    const prefix = row[0];
    const data = row[1];

    return (
        <TableRow>
            <TableCell>{prefix}</TableCell>

            <ChipListCell
                values={data.alertTypes}
                stripPath={false}
                maxChips={1}
            />

            <ChipListCell
                values={data.userSubscriptions.map(({ email }) => email)}
                stripPath={false}
                maxChips={3}
            />

            <AlertEditButton prefix={prefix} />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row key={row[0]} row={row} />
            ))}
        </>
    );
}

export default Rows;
