import { Box, Stack } from '@mui/material';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import LogsTable from 'components/tables/Logs';
import JournalDataLogsHydrator from 'stores/JournalData/Logs/Hydrator';

function Ops() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    return (
        <JournalDataLogsHydrator name={name} collectionName={collectionName}>
            <Stack spacing={2}>
                <Box>
                    <LogsTable />
                </Box>
            </Stack>
        </JournalDataLogsHydrator>
    );
}

export default Ops;
