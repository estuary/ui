import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';

function Row({ row }: RowProps) {
    const { subscriptions } = row;

    // const evaluatedAlertTypes: ChipDisplay[] = useMemo(
    //     () =>
    //         row.alertTypes
    //             .map((alertType) =>
    //                 alertTypeDefs.find((def) => def.alertType === alertType)
    //             )
    //             .filter((def) => typeof def !== 'undefined')
    //             .sort((first, second) =>
    //                 sortByAlertType(
    //                     {
    //                         isSystemAlert: first.isSystem,
    //                         value: first.displayName,
    //                     },
    //                     {
    //                         isSystemAlert: second.isSystem,
    //                         value: second.displayName,
    //                     },
    //                     'asc'
    //                 )
    //             )
    //             .map(({ displayName, isSystem }) => ({
    //                 display: displayName,
    //                 diminishedText: isSystem,
    //             })),
    //     [alertTypeDefs, row.alertTypes]
    // );

    return (
        <TableRow>
            <TableCell>{subscriptions[0].catalogPrefix}</TableCell>

            <ChipListCell
                maxChips={3}
                stripPath={false}
                values={subscriptions.map(({ email }) => email)}
            />

            <AlertEditButton
                prefix={subscriptions[0].catalogPrefix}
                subscriptionMetadata={row}
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
                    key={`${datum.subscriptions[0].id}-${index}`}
                    row={datum}
                />
            ))}
        </>
    );
}

export default Rows;
