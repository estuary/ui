import { Box, Button, LinearProgress, Stack } from '@mui/material';
import KeyValueList from 'components/shared/KeyValueList';
import UnderDev from 'components/shared/UnderDev';
import LogsTable from 'components/tables/Logs';
import { useJournalData } from 'hooks/journals/useJournalData';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { uniqWith } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { OpsLogFlowDocument } from 'types';

const docsRequested = 25;

function Ops() {
    const [fetchingMore, setFetchingMore] = useState(false);
    const [olderFinished, setOlderFinished] = useState(false);
    const [lastParsed, setLastParsed] = useState<number>(0);
    const [docs, setDocs] = useState<OpsLogFlowDocument[]>([]);

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    // TODO (typing)
    //  need to handle typing
    const { data, loading, refresh } = useJournalData(
        name,
        docsRequested,
        collectionName
    );
    const documents = useMemo(
        () => (data?.documents ?? []) as OpsLogFlowDocument[],
        [data?.documents]
    );

    useEffect(() => {
        // Get the mete data out of the response
        const meta = data?.meta;

        // Figure out what the last document offset is
        const parsedEnd = meta?.docsMetaResponse.offset
            ? parseInt(meta.docsMetaResponse.offset, 10)
            : null;

        // Keep track of where we last read data from so we can keep stepping backwards through the file
        setLastParsed(parsedEnd ?? 0);

        // If we have hit 0 then we now we hit the start of the data are nothing older is available
        if (parsedEnd === 0) {
            setOlderFinished(true);
        }
    }, [data?.meta]);

    useEffect(() => {
        // Wait until loading is complete
        if (loading || (docs.length > 0 && !fetchingMore)) {
            return;
        }

        // If we have documents add them to the list
        if (documents.length > 0) {
            const newDocs = [...documents, ...docs];
            setDocs(newDocs);
            setFetchingMore(false);
        }
    }, [docs, documents, fetchingMore, loading]);

    const uniqueDocs = useMemo(
        () =>
            uniqWith(docs, (a, b) => {
                return a._meta.uuid === b._meta.uuid;
            }),
        [docs]
    );

    return (
        <Box>
            <UnderDev />
            <Box>
                <KeyValueList
                    sectionTitle="Debugging Values"
                    data={[
                        { title: 'Documents', val: docs.length },
                        { title: 'Unique Docs', val: uniqueDocs.length },
                        { title: 'Last Byte Parsed', val: lastParsed },
                    ]}
                />

                <Stack spacing={2} direction="row">
                    <Button
                        disabled={loading || fetchingMore || olderFinished}
                        onClick={() => {
                            setFetchingMore(true);
                            refresh({
                                offset: 0,
                                endOffset: lastParsed,
                            });
                        }}
                    >
                        Load Older
                    </Button>

                    <Button
                        disabled={loading || fetchingMore}
                        onClick={() => {
                            setFetchingMore(true);
                            refresh();
                        }}
                    >
                        Load Newer
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

                    {fetchingMore || loading ? <LinearProgress /> : null}

                    <LogsTable
                        documents={uniqueDocs}
                        loading={fetchingMore || loading}
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
