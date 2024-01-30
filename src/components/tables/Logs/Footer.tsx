import {
    Divider,
    Stack,
    TableFooter,
    TableRow,
    Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { FormattedMessage } from 'react-intl';
import {
    useJournalDataLogsStore_documentCount,
    useJournalDataLogsStore_lastTimeCheckedForNew,
} from 'stores/JournalData/Logs/hooks';

function LogsTableFooter() {
    const documentsCount = useJournalDataLogsStore_documentCount();
    const lastTimeCheckedForNew =
        useJournalDataLogsStore_lastTimeCheckedForNew();

    const lastChecked = lastTimeCheckedForNew
        ? DateTime.fromISO(lastTimeCheckedForNew).toFormat(
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
                                count: documentsCount ?? 0,
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
