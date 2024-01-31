import { Box, Stack } from '@mui/material';

import LogsTable from 'components/tables/Logs';
import {
    useJournalDataLogsStore_lastParsed,
    useJournalDataLogsStore_refresh,
    useJournalDataLogsStore_setLoading,
} from 'stores/JournalData/Logs/hooks';

function OpsTableWrapper() {
    const lastParsed = useJournalDataLogsStore_lastParsed();
    const setLoading = useJournalDataLogsStore_setLoading();
    const refresh = useJournalDataLogsStore_refresh();

    return (
        <Box>
            <Box>
                <Stack spacing={2}>
                    <Box>
                        <LogsTable
                            fetchNewer={() => {
                                setLoading(true);
                                refresh();
                            }}
                            fetchOlder={() => {
                                console.log('fetch older logs');

                                setLoading(true);
                                refresh({
                                    offset: 0,
                                    endOffset: lastParsed,
                                });
                            }}
                        />
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}

export default OpsTableWrapper;
