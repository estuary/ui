import { useJournalData } from 'hooks/journals/useJournalData';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { OpsLogFlowDocument } from 'types';
import { maxBytes } from 'components/tables/Logs/shared';
import { AddingLogTypes, LoadDocumentsOffsets } from './shared';

function useOpsLogs(name: string, collectionName: string) {
    const [nothingInLastFetch, setNothingInLastFetch] = useState(false);
    const [olderFinished, setOlderFinished] = useState(false);
    const [lastParsed, setLastParsed] = useState<number>(-1);
    const [docs, setDocs] = useState<
        [AddingLogTypes, OpsLogFlowDocument[] | null]
    >(['init', null]);

    const [bytes, setBytes] = useState(maxBytes);

    // TODO (typing)
    //  need to handle typing
    const { data, error, loading, refresh } = useJournalData(
        name,
        collectionName,
        {
            maxBytes: bytes,
        }
    );

    const documents = useMemo<OpsLogFlowDocument[] | null>(() => {
        if (!error && data?.documents) {
            return data.documents as OpsLogFlowDocument[];
        }

        return null;
    }, [data?.documents, error]);

    useEffect(() => {
        if (data?.adjustedBytes && data.adjustedBytes > 0) {
            setBytes(data.adjustedBytes);
        }
    }, [bytes, data?.adjustedBytes]);

    useEffect(() => {
        // Get the mete data out of the response
        const meta = data?.meta;

        // Figure out what the last document offset is
        const parsedEnd = meta?.docsMetaResponse.offset
            ? parseInt(meta.docsMetaResponse.offset, 10)
            : null;

        if (!parsedEnd || !documents || documents.length <= 0) {
            return;
        }

        // Since journalData is read kinda async we need to wait to
        //  update documents until we know the meta data changed
        if (parsedEnd !== lastParsed) {
            // If the parsed is lower than the other
            const initialLoading = lastParsed === -1;
            const olderLogs = !initialLoading && parsedEnd < lastParsed;
            const addType: AddingLogTypes = initialLoading
                ? 'init'
                : olderLogs
                ? 'old'
                : 'new';

            console.log('~olderLogs', { addType, olderLogs });

            setNothingInLastFetch(false);
            setDocs([
                // TODO (typing) - hacky work around
                addType,
                documents,
            ]);

            // Keep track of where we last read data from so we can keep stepping backwards through the file
            setLastParsed(parsedEnd);

            // If we have hit 0 then we now we hit the start of the data any nothing older is available
            if (parsedEnd === 0) {
                setOlderFinished(true);
            }
        } else if (lastParsed > 0) {
            setNothingInLastFetch(true);
        }
    }, [data?.meta, documents, lastParsed]);

    const runRefresh = useCallback(
        (newOffset?: LoadDocumentsOffsets) => {
            setNothingInLastFetch(false);
            refresh(newOffset);
        },
        [refresh]
    );

    return useMemo(
        () => ({
            docs,
            error,
            lastParsed,
            loading,
            nothingInLastFetch,
            olderFinished,
            refresh: runRefresh,
        }),
        [
            docs,
            error,
            lastParsed,
            loading,
            nothingInLastFetch,
            olderFinished,
            runRefresh,
        ]
    );
}

export default useOpsLogs;
