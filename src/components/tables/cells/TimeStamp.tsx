import { Box, TableCell, Tooltip } from '@mui/material';

import { formatDistanceToNow, formatRelative } from 'date-fns';
import { FormattedDate } from 'react-intl';

interface Props {
    time: string | Date;
    enableExact?: boolean;
    enableRelative?: boolean;
}

function TimeStamp({ enableExact, enableRelative, time }: Props) {
    return (
        <TableCell>
            <Tooltip
                title={
                    <FormattedDate
                        day="numeric"
                        month="long"
                        year="numeric"
                        hour="numeric"
                        minute="numeric"
                        second="numeric"
                        timeZoneName="short"
                        value={time}
                    />
                }
                placement="bottom-start"
            >
                <Box>
                    {enableExact ? (
                        <FormattedDate
                            day="2-digit"
                            month="short"
                            year="numeric"
                            hour="numeric"
                            minute="numeric"
                            second="numeric"
                            timeZoneName="short"
                            value={time}
                        />
                    ) : enableRelative ? (
                        formatRelative(new Date(time), new Date())
                    ) : (
                        formatDistanceToNow(new Date(time), {
                            addSuffix: true,
                        })
                    )}
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default TimeStamp;
