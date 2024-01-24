import { Box, Button, Stack } from '@mui/material';
import KeyValueList from 'components/shared/KeyValueList';
import UnderDev from 'components/shared/UnderDev';
import LogsTable from 'components/tables/Logs';
import { useJournalData } from 'hooks/journals/useJournalData';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect, useMemo, useState } from 'react';
import { OpsLogFlowDocument } from 'types';
import { MEGABYTE } from 'utils/dataPlane-utils';
import Error from 'components/shared/Error';
import { BASE_ERROR } from 'services/supabase';

const maxBytes = Math.round(MEGABYTE / 25);

function Ops() {
    const [fetchingMore, setFetchingMore] = useState(false);
    const [olderFinished, setOlderFinished] = useState(false);
    const [lastParsed, setLastParsed] = useState<number>(0);
    const [docs, setDocs] = useState<OpsLogFlowDocument[]>([]);

    const catalogName = useGlobalSearchParams(GlobalSearchParams.CATALOG_NAME);
    const [name, collectionName] = useJournalNameForLogs(catalogName);

    // TODO (typing)
    //  need to handle typing
    const { data, error, loading, refresh } = useJournalData(
        name,
        collectionName,
        {
            maxBytes,
        }
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

        // Since journalData is read kinda async we need to wait to
        //  update documents until we know the meta data changed
        if (parsedEnd !== lastParsed) {
            if (documents.length > 0) {
                const newDocs = [...documents, ...docs];
                setDocs(newDocs);
                setFetchingMore(false);
            }
        }
    }, [data?.meta, docs, documents, lastParsed]);

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

    return (
        <Box>
            <UnderDev />
            <Box>
                <KeyValueList
                    sectionTitle="Debugging Values"
                    data={[
                        { title: 'Documents', val: docs.length },
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

                    {error ? (
                        <Error
                            error={{
                                ...BASE_ERROR,
                                message: error.message,
                            }}
                            condensed
                        />
                    ) : null}

                    <LogsTable
                        documents={docs}
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
