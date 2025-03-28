import { TableCell, Typography } from '@mui/material';

import { BaseCellSx, BaseTypographySx } from './shared';
import { DateTime } from 'luxon';

interface Props {
    ts: string;
}

function TimestampCell({ ts }: Props) {
    const formattedDateTime = DateTime.fromISO(ts, {
        zone: 'UTC',
    }).toFormat('yyyy-LL-dd HH:mm:ss.SSS ZZZZ');

    return (
        <TableCell sx={BaseCellSx} component="div">
            <Typography noWrap sx={BaseTypographySx}>
                {formattedDateTime.includes('Invalid') ? '' : formattedDateTime}
            </Typography>
        </TableCell>
    );
}

export default TimestampCell;
