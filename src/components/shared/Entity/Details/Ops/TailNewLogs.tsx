import { Checkbox, FormControl, FormControlLabel } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { useIntl } from 'react-intl';

import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

const intlKey = 'ops.logsTable.tailNewLogs';

// TODO (log tailing)
// No currently enabled
function TailNewLogs() {
    const intl = useIntl();

    const [tailNewLogs, setTailNewLogs] = useJournalDataLogsStore(
        useShallow((state) => [state.tailNewLogs, state.setTailNewLogs])
    );

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
