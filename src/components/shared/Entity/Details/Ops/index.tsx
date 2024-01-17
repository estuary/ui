import { Box, Button, LinearProgress, Stack } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import UnderDev from 'components/shared/UnderDev';
import LogsTable from 'components/tables/Logs';
import { useJournalData } from 'hooks/journals/useJournalData';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { OpsLogFlowDocument } from 'types';

const docsRequested = 25;

function Ops() {
    const [loading] = useState(false);

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    // TODO (typing)
    //  need to handle typing
    const journalData = useJournalData(name, docsRequested, collectionName);
    const documents = (journalData.data?.documents ??
        []) as OpsLogFlowDocument[];

    const meta = journalData.data?.meta;
    console.log('meta', meta);

    const parsedEnd = parseInt(meta?.fragment?.end ?? '0', 10);
    const allLogsLoaded =
        documents.length > 0 && parsedEnd >= (meta?.writeHead ?? 0);

    return (
        <Box>
            <UnderDev />
            <Box>
                <Button
                    disabled={allLogsLoaded}
                    onClick={() =>
                        journalData.refresh({
                            offset: parsedEnd,
                            endOffset: 0,
                        })
                    }
                >
                    Load Older Logs (wip)
                </Button>

                <Stack>
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

                    {allLogsLoaded ? (
                        <AlertBox short severity="success">
                            <FormattedMessage id="ops.logsTable.allOldLogsLoaded" />
                        </AlertBox>
                    ) : null}

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
