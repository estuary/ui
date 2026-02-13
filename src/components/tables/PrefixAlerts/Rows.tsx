import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';
import { UNDERSCORE_RE } from 'src/validation';

function Row({ row }: RowProps) {
    return (
        <TableRow>
            <TableCell>{row.catalogPrefix}</TableCell>

            <ChipListCell
                values={row.alertTypes.map((value) =>
                    value.replace(UNDERSCORE_RE, ' ')
                )}
                stripPath={false}
                maxChips={1}
            />

            <TableCell>{row.email}</TableCell>

            <AlertEditButton prefix={row.catalogPrefix} />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row key={`${row.catalogPrefix}-${row.email}`} row={row} />
            ))}
        </>
    );
}

export default Rows;
