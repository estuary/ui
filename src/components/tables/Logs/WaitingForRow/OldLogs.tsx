import { TableCell, TableRow } from '@mui/material';
import SpinnerIcon from 'components/logs/SpinnerIcon';
import { BaseCellSx } from 'components/tables/cells/logs/shared';
import { CSSProperties } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    style?: CSSProperties;
}

function WaitingForOldLogsRow({ style }: Props) {
    return (
        <TableRow component="div" style={style}>
            <TableCell sx={BaseCellSx} component="div">
                <SpinnerIcon stopped={false} />
            </TableCell>
            <TableCell colSpan={2} sx={BaseCellSx} component="div">
                <FormattedMessage id="ops.logsTable.waitingForOldLogs" />
            </TableCell>
        </TableRow>
    );
}

export default WaitingForOldLogsRow;
