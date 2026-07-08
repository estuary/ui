import type {
    RowProps,
    RowsProps,
} from 'src/components/tables/PrefixAlerts/types';

import { TableCell, TableRow } from '@mui/material';

import ChipListCell from 'src/components/tables/cells/ChipList';
import AlertEditButton from 'src/components/tables/cells/prefixAlerts/EditButton';

function Row({ row }: RowProps) {
    const { subscriptions } = row;

    return (
        <TableRow>
            <TableCell>{subscriptions[0].catalogPrefix}</TableCell>

            <ChipListCell
                maxChips={3}
                stripPath={false}
                values={subscriptions.map(({ email }) =>
                    email.length > 0 ? email : 'N/A'
                )}
            />

            <AlertEditButton
                prefix={subscriptions[0].catalogPrefix}
                subscriptionMetadata={row}
            />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((datum, index) => (
                <Row
                    key={`${datum.subscriptions[0].id}-${index}`}
                    row={datum}
                />
            ))}
        </>
    );
}

export default Rows;
