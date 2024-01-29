import {
    Divider,
    Stack,
    TableFooter,
    TableRow,
    Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';

interface Props {
    logsCount: number;
    lastCheckedForNew: string | null;
}

function LogsTableFooter({ logsCount, lastCheckedForNew }: Props) {
    const lastChecked = lastCheckedForNew
        ? DateTime.fromISO(lastCheckedForNew).toFormat(
              'yyyy-LL-dd HH:mm:ss.SSS ZZZZ'
          )
        : null;
    return (
        <TableFooter component="div">
            <TableRow component="div" sx={{ height: 35 }}>
                <Stack
                    direction="row"
                    divider={<Divider orientation="vertical" flexItem />}
                    spacing={2}
                >
                    <Typography>
                        <FormattedMessage
                            id="ops.logsTable.footer.lines"
                            values={{
                                count: logsCount,
                            }}
                        />
                    </Typography>

                    {lastChecked ? (
                        <Typography>No new logs as of {lastChecked}</Typography>
                    ) : null}
                </Stack>
            </TableRow>
        </TableFooter>
    );
}

export default LogsTableFooter;
