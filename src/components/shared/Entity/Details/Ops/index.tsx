import { Box, Button, LinearProgress, Stack } from '@mui/material';
import UnderDev from 'components/shared/UnderDev';
import LogsTable from 'components/tables/Logs';
import { useJournalData } from 'hooks/journals/useJournalData';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect, useState } from 'react';
import { OpsLogFlowDocument } from 'types';

const docsRequested = 25;

function Ops() {
    const [loading] = useState(false);
    const [olderFinished, setOlderFinished] = useState(false);
    const [lastParsed, setLastParsed] = useState<number>(0);

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    // TODO (typing)
    //  need to handle typing
    const journalData = useJournalData(name, docsRequested, collectionName);
    const documents = (journalData.data?.documents ??
        []) as OpsLogFlowDocument[];

    useEffect(() => {
        console.log('Ops:journalData:effect', journalData);

        // Wait until loading is complete
        if (journalData.loading) {
            return;
        }

        // If we have documents add them to the list
        if (journalData.data?.documents) {
            // This is where we need to populate a list of docs we maintain
            // journalData.data.documents.forEach((doc) => {});
        }

        // Get the mete data out of the response
        const meta = journalData.data?.meta;

        // Figure out what the last document offset is
        const parsedEnd = meta?.docsMetaResponse.offset
            ? parseInt(meta.docsMetaResponse.offset, 10)
            : null;

        setLastParsed(parsedEnd ?? 0);

        if (
            journalData.data?.documents &&
            journalData.data.documents.length > 0 &&
            parsedEnd === 0
        ) {
            setOlderFinished(true);
        }

        // We only care about the data changing here
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [journalData]);

    console.log('Ops:journalData:data:meta', {
        documents,
        olderFinished,
    });

    return (
        <Box>
            <UnderDev />
            <Box>
                <Stack spacing={2} direction="row">
                    <Button
                        disabled={olderFinished}
                        onClick={() =>
                            journalData.refresh({
                                offset: 0,
                                endOffset: lastParsed,
                            })
                        }
                    >
                        Load Older (wip - might blow up)
                    </Button>

                    <Button onClick={() => journalData.refresh()}>
                        Load Newer (wip - just full refresh right now)
                    </Button>
                </Stack>

                <Stack spacing={2}>
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
                        fetchOlder={
                            olderFinished
                                ? undefined
                                : () => {
                                      console.log('fetch older logs');

                                      // setLoading(true);
                                      // setTimeout(() => setLoading(false), 2500);
                                  }
                        }
                    />
                </Stack>
            </Box>
        </Box>
    );
}

export default Ops;
