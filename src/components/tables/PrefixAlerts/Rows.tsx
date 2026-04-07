import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';
import type { AlertTypeInfo } from 'src/gql-types/graphql';

import { useMemo } from 'react';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';
import { sortByAlertType } from 'src/utils/misc-utils';

function Row({ alertTypeDefs, row }: RowProps) {
    const evaluatedAlertTypes: AlertTypeInfo[] = useMemo(
        () =>
            row.alertTypes
                .map((alertType) =>
                    alertTypeDefs.find((def) => def.alertType === alertType)
                )
                .filter((def) => typeof def !== 'undefined'),
        [alertTypeDefs, row.alertTypes]
    );

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
                                isSystemAlert: first.isSystem,
                                value: first.displayName,
                            },
                            {
                                isSystemAlert: second.isSystem,
                                value: second.displayName,
                            },
                            'asc'
                        )
                    )
                    .map(({ displayName, isSystem }) => ({
                        display: displayName,
                        diminishedText: isSystem,
                    }))}
            />

            <TableCell>{row.email}</TableCell>

            <AlertEditButton
                alertTypes={row.alertTypes}
                email={row.email}
                prefix={row.catalogPrefix}
            />
        </TableRow>
    );
}

function Rows({ alertTypeDefs, data }: RowsProps) {
    return (
        <>
            {data.map((datum, index) => (
                <Row
                    alertTypeDefs={alertTypeDefs}
                    key={`${datum.catalogPrefix}-${datum.email}-${index}`}
                    row={datum}
                />
            ))}
        </>
    );
}

export default Rows;
