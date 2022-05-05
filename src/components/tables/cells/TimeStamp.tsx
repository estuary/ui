import { Box, TableCell, Tooltip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { FormattedDate } from 'react-intl';

interface Props {
    time: string;
}

function TimeStamp({ time }: Props) {
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
                    {formatDistanceToNow(new Date(time), {
                        addSuffix: true,
                    })}
                </Box>
            </Tooltip>
        </TableCell>
    );
}

export default TimeStamp;
