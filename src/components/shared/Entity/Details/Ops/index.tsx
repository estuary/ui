import { Box, Button, LinearProgress, Stack } from '@mui/material';
import UnderDev from 'components/shared/UnderDev';
import LogsTable from 'components/tables/Logs';
import { useJournalData } from 'hooks/journals/useJournalData';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useState } from 'react';
import { OpsLogFlowDocument } from 'types';

const docsRequested = 2;

function Ops() {
    const [loading] = useState(false);

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    // TODO (typing)
    //  need to handle typing
    const journalData = useJournalData(name, docsRequested, collectionName);
    const documents = (journalData.data?.documents ??
        []) as OpsLogFlowDocument[];

    return (
        <Box>
            <UnderDev />
            <Box>
                <Button onClick={() => journalData.refresh(0)}>
                    Load Older Logs
                </Button>

                <Stack>
                    <Box>Documents {documents.length}</Box>

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

                    <LogsTable
                        documents={documents}
                        loading={loading}
                        fetchNewer={() => {
                            console.log('fetcher latest logs');

                            // setLoading(true);
                            // setTimeout(() => setLoading(false), 2500);
                        }}
                        fetchOlder={() => {
                            console.log('fetch older logs');

                            // setLoading(true);
                            // setTimeout(() => setLoading(false), 2500);
                        }}
                    />
                </Stack>
            </Box>
        </Box>
    );
}

export default Ops;
