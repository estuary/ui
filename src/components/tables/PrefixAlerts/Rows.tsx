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

            {/* The combination of the customized alignment and padding in this cell
                is used to mock centered cell contain while maintaining the ability
                to scroll the ChipList content. */}
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
            {data.map((datum) => (
                <Row
                    executeQuery={executeQuery}
                    key={`${datum.catalogPrefix}-${datum.email}`}
                    row={datum}
                />
            ))}
        </>
    );
}

export default Rows;
