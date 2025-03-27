import { TableCell, Typography } from '@mui/material';

import { DateTime } from 'luxon';

import {
    BaseCellSx,
    BaseTypographySx,
} from 'src/components/tables/cells/logs/shared';

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
