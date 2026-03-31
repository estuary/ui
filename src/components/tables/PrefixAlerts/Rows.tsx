import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';
import type { AlertTypeDef } from 'src/types/gql';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';
import { sortByAlertType } from 'src/components/tables/PrefixAlerts/shared';

function Row({ alertTypeDefs, executeQuery, row }: RowProps) {
    const evaluatedAlertTypes: AlertTypeDef[] = row.alertTypes
        .map((alertType) =>
            alertTypeDefs.find((def) => def.alertType === alertType)
        )
        .filter((def) => typeof def !== 'undefined');

    return (
        <TableRow>
            <TableCell>{row.catalogPrefix}</TableCell>

            <ChipListCell
                maxChips={3}
                stripPath={false}
                values={evaluatedAlertTypes
                    .sort((first, second) =>
                        sortByAlertType(
                            {
                                isSystemAlert: first.isSystemAlert,
                                value: first.displayName,
                            },
                            {
                                isSystemAlert: second.isSystemAlert,
                                value: second.displayName,
                            },
                            'asc'
                        )
                    )
                    .map(({ alertType: name, isSystemAlert }) => ({
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
