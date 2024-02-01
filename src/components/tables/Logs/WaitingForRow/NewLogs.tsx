import { Box, TableCell, TableRow, Typography, useTheme } from '@mui/material';
import SpinnerIcon from 'components/logs/SpinnerIcon';
import { BaseTypographySx } from 'components/tables/cells/logs/shared';
import { tableRowActiveBackground } from 'context/Theme';
import { CSSProperties, RefCallback } from 'react';
import { FormattedMessage } from 'react-intl';

interface Props {
    sizeRef: RefCallback<HTMLElement>;
    style?: CSSProperties;
}

function WaitingForNewLogsRow({ sizeRef, style }: Props) {
    const theme = useTheme();

    return (
        <TableRow
            component={Box}
            ref={sizeRef}
            style={style}
            sx={{
                bgcolor: tableRowActiveBackground[theme.palette.mode],
            }}
        >
            <TableCell component="div" />
            <TableCell
                sx={{
                    pl: 2.5,
                }}
                component="div"
            >
                <SpinnerIcon stopped={false} />
            </TableCell>
            <TableCell sx={{ width: '100%' }} component="div">
                <Typography sx={BaseTypographySx}>
                    <FormattedMessage id="ops.logsTable.waitingForNewLogs" />
                </Typography>
            </TableCell>
        </TableRow>
    );
}

export default WaitingForNewLogsRow;
