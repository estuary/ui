import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';
import { UNDERSCORE_RE } from 'src/validation';

function Row({ executeQuery, row }: RowProps) {
    return (
        <TableRow>
            <TableCell>{row.catalogPrefix}</TableCell>

            <ChipListCell
                values={row.alertTypes
                    .map((value) => value.replace(UNDERSCORE_RE, ' '))
                    .sort()}
                stripPath={false}
                maxChips={1}
            />

            <TableCell>{row.email}</TableCell>

            <AlertEditButton
                alertTypes={row.alertTypes}
                email={row.email}
                executeQuery={executeQuery}
                prefix={row.catalogPrefix}
            />
        </TableRow>
    );
}

function Rows({ data, executeQuery }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row
                    executeQuery={executeQuery}
                    key={`${row.catalogPrefix}-${row.email}`}
                    row={row}
                />
            ))}
        </>
    );
}

export default Rows;
