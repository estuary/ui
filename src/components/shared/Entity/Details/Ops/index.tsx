import { Box, Button, LinearProgress, Stack } from '@mui/material';
import UnderDev from 'components/shared/UnderDev';
import { useJournalData } from 'hooks/journals/useJournalData';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import LogsTable from './LogsTable';

const docsRequested = 25;

function Ops() {
    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);

    const [name, collectionName] = useJournalNameForLogs(catalogName);

    const journalData = useJournalData(name, docsRequested, collectionName);

    console.log('journalData', journalData);

    return (
        <Box>
            <UnderDev />
            <Box>
                <Button onClick={journalData.refresh}>Refresh</Button>
                <Stack>
                    <Box>Documents {journalData.data?.documents.length}</Box>

                    {/*                    <JournalAlerts
                        journalData={journalData}
                        notFoundTitleMessage={
                            <FormattedMessage
                                id="ops.journals.notFound.message"
                                values={{
                                    entityType,
                                }}
                            />
                        }
                    />*/}

                    {journalData.loading ? <LinearProgress /> : null}
                    <LogsTable documents={journalData.data?.documents ?? []} />
                </Stack>
            </Box>
        </Box>
    );
}

export default Ops;
