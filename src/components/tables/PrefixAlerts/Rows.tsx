import type { ChipDisplay } from 'src/components/shared/ChipList/types';
import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';

import { useMemo } from 'react';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';
import { sortByAlertType } from 'src/utils/misc-utils';

function Row({ alertTypeDefs, row }: RowProps) {
    const evaluatedAlertTypes: ChipDisplay[] = useMemo(
        () =>
            row.alertTypes
                .map((alertType) =>
                    alertTypeDefs.find((def) => def.alertType === alertType)
                )
                .filter((def) => typeof def !== 'undefined')
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
                })),
        [alertTypeDefs, row.alertTypes]
    );

    return (
        <TableRow>
            <TableCell>{row.catalogPrefix}</TableCell>

            <ChipListCell
                maxChips={3}
                stripPath={false}
                values={evaluatedAlertTypes}
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
