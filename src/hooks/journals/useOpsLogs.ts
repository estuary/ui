import { useJournalData } from 'hooks/journals/useJournalData';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { OpsLogFlowDocument } from 'types';
import { maxBytes, UUID_START_OF_LOGS } from 'components/tables/Logs/shared';
import { useIntl } from 'react-intl';
import { RefreshLogsFunction } from 'components/tables/Logs/types';

function useOpsLogs(name: string, collectionName: string) {
    const intl = useIntl();

    const [fetchingMore, setFetchingMore] = useState(false);
    const [olderFinished, setOlderFinished] = useState(false);
    const [lastParsed, setLastParsed] = useState<number>(0);
    const [docs, setDocs] = useState<OpsLogFlowDocument[]>([]);

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
        if (parsedEnd && parsedEnd !== lastParsed) {
            if (documents.length > 0) {
                // If the parsed is lower than the other
                const newDocs =
                    lastParsed > parsedEnd
                        ? [...docs, ...documents]
                        : [...documents, ...docs];

                if (parsedEnd === 0) {
                    newDocs.unshift({
                        _meta: {
                            uuid: UUID_START_OF_LOGS,
                        },
                        level: 'waiting',
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

    const startFetchingMore = useCallback<RefreshLogsFunction>(
        (newOffset) => {
            setFetchingMore(true);
            refresh(newOffset);
        },
        [refresh]
    );

    return useMemo(
        () => ({
            docs,
            error,
            fetchingMore,
            olderFinished,
            lastParsed,
            loading,
            refresh: startFetchingMore,
        }),
        [
            docs,
            error,
            fetchingMore,
            lastParsed,
            loading,
            olderFinished,
            startFetchingMore,
        ]
    );
}

export default useOpsLogs;
