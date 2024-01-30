import { Box, Stack } from '@mui/material';

import LogsTable from 'components/tables/Logs';
import {
    useJournalDataLogsStore_documents,
    useJournalDataLogsStore_lastParsed,
    useJournalDataLogsStore_loading,
    useJournalDataLogsStore_refresh,
    useJournalDataLogsStore_setLoading,
} from 'stores/JournalData/Logs/hooks';

function OpsTableWrapper() {
    const docs = useJournalDataLogsStore_documents();
    const loading = useJournalDataLogsStore_loading();
    const lastParsed = useJournalDataLogsStore_lastParsed();
    const setLoading = useJournalDataLogsStore_setLoading();
    const refresh = useJournalDataLogsStore_refresh();

    return (
        <Box>
            <Box>
                <Stack spacing={2}>
                    <Box>
                        <LogsTable
                            documents={docs ?? []}
                            loading={Boolean(loading)}
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
