import { Box, Stack } from '@mui/material';
import { useJournalData } from 'hooks/journals/useJournalData';
import useJournalNameForLogs from 'hooks/journals/useJournalNameForLogs';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect, useMemo, useState } from 'react';
import { OpsLogFlowDocument } from 'types';
import Error from 'components/shared/Error';
import { BASE_ERROR } from 'services/supabase';
import LogsTable from 'components/tables/Logs';
import { maxBytes, START_OF_LOGS_UUID } from 'components/tables/Logs/shared';
import { useIntl } from 'react-intl';

function OpsTableWrapper() {
    const intl = useIntl();

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

                if (parsedEnd === 0) {
                    newDocs.unshift({
                        _meta: {
                            uuid: START_OF_LOGS_UUID,
                        },
                        level: 'info',
                        message: intl.formatMessage({
                            id: 'ops.logsTable.allOldLogsLoaded',
                        }),
                        ts: '',
                    });
                }

                setDocs(newDocs);
                setFetchingMore(false);
            }
        }
    }, [data?.meta, docs, documents, intl, lastParsed]);

    useEffect(() => {
        // Get the mete data out of the response
        const meta = data?.meta;

        // Figure out what the last document offset is
        const parsedEnd = meta?.docsMetaResponse.offset
            ? parseInt(meta.docsMetaResponse.offset, 10)
            : null;

        // Keep track of where we last read data from so we can keep stepping backwards through the file
        setLastParsed(parsedEnd ?? 0);

        // If we have hit 0 then we now we hit the start of the data any nothing older is available
        if (parsedEnd === 0) {
            setOlderFinished(true);
        }
    }, [data?.meta]);

    return (
        <Box>
            <Box>
                <Stack spacing={2}>
                    {error ? (
                        <Error
                            error={{
                                ...BASE_ERROR,
                                message: error.message,
                            }}
                            condensed
                        />
                    ) : null}

                    <Box>
                        <LogsTable
                            documents={docs}
                            loading={fetchingMore || loading}
                            fetchNewer={() => {
                                setFetchingMore(true);
                                refresh();
                            }}
                            fetchOlder={
                                olderFinished
                                    ? undefined
                                    : () => {
                                          console.log('fetch older logs');

                                          setFetchingMore(true);
                                          refresh({
                                              offset: 0,
                                              endOffset: lastParsed,
                                          });
                                      }
                            }
                        />
                    </Box>
                </Stack>
            </Box>
        </Box>
    );
}

export default OpsTableWrapper;
