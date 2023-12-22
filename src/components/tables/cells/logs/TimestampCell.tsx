import { TableCell, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { BaseCellSx, BaseTypographySx } from './shared';

interface Props {
    ts: string;
}

function TimestampCell({ ts }: Props) {
    return (
        <TableCell sx={BaseCellSx}>
            <Typography noWrap sx={BaseTypographySx}>
                {DateTime.fromISO(ts).toFormat('yyyy-LL-dd HH:mm:ss.SSS ZZZZ')}
            </Typography>
        </TableCell>
    );
}

export default TimestampCell;
