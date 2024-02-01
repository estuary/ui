import { TableCell, TableRow } from '@mui/material';
import SpinnerIcon from 'components/logs/SpinnerIcon';
import { FormattedMessage } from 'react-intl';

function WaitingForNewLogs() {
    return (
        <TableRow component="div">
            <TableCell>
                <SpinnerIcon severity="info" stopped={false} />
            </TableCell>
            <TableCell colSpan={2}>
                <FormattedMessage id="ops.logsTable.waitingForNewLogs" />
            </TableCell>
        </TableRow>
    );
}

export default WaitingForNewLogs;
