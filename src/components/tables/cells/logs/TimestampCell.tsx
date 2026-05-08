import { Chip, TableCell } from '@mui/material';

import { DateTime } from 'luxon';

import HoverPopper from 'src/components/shared/HoverPopper';
import TimestampPopperContent from 'src/components/shared/TimestampPopperContent';
import {
    BaseCellSx,
    BaseTypographySx,
    LOGS_DATE_FORMAT,
} from 'src/components/tables/cells/logs/shared';

interface Props {
    ts: string;
}

function TimestampCell({ ts }: Props) {
    const dt = DateTime.fromISO(ts, { zone: 'UTC' });

    if (!dt.isValid) {
        return <TableCell sx={BaseCellSx} component="div" />;
    }

    const formattedDateTime = dt.toFormat(LOGS_DATE_FORMAT);

    return (
        <TableCell sx={BaseCellSx} component="div">
            <HoverPopper
                popperContent={
                    <TimestampPopperContent dateTime={dt} showRelative />
                }
                popperProps={{ placement: 'right' }}
            >
                <Chip
                    sx={BaseTypographySx}
                    label={formattedDateTime}
                    size="small"
                    variant="outlined"
                />
            </HoverPopper>
        </TableCell>
    );
}

export default TimestampCell;
