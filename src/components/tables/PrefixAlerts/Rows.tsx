import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';
import type { ExpandedAlertTypeDef } from 'src/types/gql';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';

function Row({ alertTypeDefs, executeQuery, row }: RowProps) {
    const evaluatedAlertTypes: ExpandedAlertTypeDef[] = row.alertTypes
        .map((id) => alertTypeDefs.find((def) => def.id === id))
        .filter((def) => typeof def !== 'undefined');

    return (
        <TableRow>
            <TableCell>{row.catalogPrefix}</TableCell>

            <ChipListCell
                maxChips={1}
                stripPath={false}
                values={evaluatedAlertTypes.map(({ name, isSystemAlert }) => ({
                    display: name,
                    diminishedText: isSystemAlert,
                }))}
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

function Rows({ alertTypeDefs, data, executeQuery }: RowsProps) {
    return (
        <>
            {data.map((datum) => (
                <Row
                    alertTypeDefs={alertTypeDefs}
                    executeQuery={executeQuery}
                    key={`${datum.catalogPrefix}-${datum.email}`}
                    row={datum}
                />
            ))}
        </>
    );
}

export default Rows;
