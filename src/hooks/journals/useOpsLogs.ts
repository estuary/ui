import { useJournalData } from 'hooks/journals/useJournalData';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { OpsLogFlowDocument } from 'types';
import { maxBytes } from 'components/tables/Logs/shared';
import { AddingLogTypes, LoadDocumentsOffsets } from './shared';

function useOpsLogs(name: string, collectionName: string) {
    const [nothingInLastFetch, setNothingInLastFetch] = useState(false);
    const [oldestParsed, setOldestParsed] = useState<number>(-1);
    const [newestParsed, setNewestParsed] = useState<number>(-1);
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

        // We parsed something so now let's check the ranges
        const end = meta?.ranges.end ?? null;
        const start = meta?.ranges.start ?? null;

        if (
            end === null ||
            start === null ||
            !documents ||
            documents.length <= 0
        ) {
            return;
        }

        // Check if we're doing an init, new, or old
        const initialLoading = oldestParsed === -1 && newestParsed === -1;
        const loadingOlder = !initialLoading && start < oldestParsed;
        const loadingNewer = !initialLoading && end > newestParsed;

        // Since journalData always returns an array for docs we
        //  only know to update the logs when we have a new
        //  oldest/newest range returned
        if (initialLoading || loadingOlder || loadingNewer) {
            // Keep track of where we last read data from so we can keep stepping backwards through the file
            setOldestParsed((previousOldestParsed) =>
                initialLoading || start < previousOldestParsed
                    ? start
                    : previousOldestParsed
            );

            setNewestParsed((previousNewestParsed) =>
                initialLoading || end > previousNewestParsed
                    ? end
                    : previousNewestParsed
            );

            // Now set a flag so we know where to put the logs in the store
            const addType: AddingLogTypes = initialLoading
                ? 'init'
                : loadingOlder
                ? 'old'
                : 'new';
            setDocs([addType, documents]);
            setNothingInLastFetch(false);
        } else {
            setNothingInLastFetch(true);
        }
    }, [data?.meta, documents, newestParsed, oldestParsed]);

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
            newestParsed,
            oldestParsed,
            loading,
            nothingInLastFetch,
            refresh: runRefresh,
        }),
        [
            docs,
            error,
            loading,
            newestParsed,
            nothingInLastFetch,
            oldestParsed,
            runRefresh,
        ]
    );
}

export default useOpsLogs;
