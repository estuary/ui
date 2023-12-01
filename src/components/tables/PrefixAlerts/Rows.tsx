import { TableCell, TableRow, useTheme } from '@mui/material';
import ChipListCell from 'components/tables/cells/ChipList';
import AlertEditButton from 'components/tables/cells/prefixAlerts/EditButton';
import { getEntityTableRowSx } from 'context/Theme';
import { PrefixSubscription } from 'utils/notification-utils';

interface RowsProps {
    data: [string, PrefixSubscription][];
}

interface RowProps {
    row: [string, PrefixSubscription];
}

function Row({ row }: RowProps) {
    const theme = useTheme();

    const prefix = row[0];
    const data = row[1];

    return (
        <TableRow hover sx={getEntityTableRowSx(theme)}>
            <TableCell>{prefix}</TableCell>

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
