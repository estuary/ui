import { Box, TableCell, Tooltip } from '@mui/material';
import { formatDistanceToNow, formatRelative } from 'date-fns';
import { FormattedDate } from 'react-intl';

interface Props {
    time: string;
    enableRelative?: boolean;
}

function TimeStamp({ enableRelative, time }: Props) {
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
                    {!enableRelative
                        ? formatDistanceToNow(new Date(time), {
                              addSuffix: true,
                          })
                        : formatRelative(new Date(time), new Date())}
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default TimeStamp;
