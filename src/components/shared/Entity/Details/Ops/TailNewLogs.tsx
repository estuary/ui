import { Checkbox, FormControl, FormControlLabel } from '@mui/material';
import { useIntl } from 'react-intl';
import {
    useJournalDataLogsStore_setTailNewLogs,
    useJournalDataLogsStore_tailNewLogs,
} from 'stores/JournalData/Logs/hooks';

const intlKey = 'ops.logsTable.tailNewLogs';

function TailNewLogs() {
    const intl = useIntl();

    const tailNewLogs = useJournalDataLogsStore_tailNewLogs();
    const setTailNewLogs = useJournalDataLogsStore_setTailNewLogs();

    return (
        <FormControl sx={{ mx: 0 }}>
            <FormControlLabel
                control={<Checkbox value={intlKey} checked={tailNewLogs} />}
                onChange={(event, checked) => setTailNewLogs(checked)}
                label={intl.formatMessage({ id: intlKey })}
            />
        </FormControl>
    );
}

export default TailNewLogs;
