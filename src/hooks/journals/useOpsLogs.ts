import type { ProtocolStatus } from 'data-plane-gateway/types/gen/broker/protocol/broker';
import type {
    LoadDocumentsOffsets,
    UseOpsLogsDocs,
} from 'src/hooks/journals/types';
import type { OpsLogFlowDocument } from 'src/types';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { maxBytes } from 'src/components/tables/Logs/shared';
import { useJournalData } from 'src/hooks/journals/useJournalData';
import useJournalStore from 'src/stores/JournalData/Store';

function useOpsLogs() {
    const journalName = useJournalStore((state) => state.opsLogsJournal);

    const [readStatus, setReadStatus] = useState<ProtocolStatus | undefined>(
        undefined
    );
    const [nothingInLastFetch, setNothingInLastFetch] = useState(false);
    const [oldestParsed, setOldestParsed] = useState<number>(-1);
    const [newestParsed, setNewestParsed] = useState<number>(-1);
    const [docs, setDocs] = useState<UseOpsLogsDocs>([[-1, -1], null]);

    const { data, error, loading, refresh } = useJournalData(
        journalName,
        {
            maxBytes,
        },
        true
    );

    const documents = useMemo<OpsLogFlowDocument[] | null>(() => {
        if (!error && data?.documents) {
            return data.documents as OpsLogFlowDocument[];
        }

        return null;
    }, [data?.documents, error]);

    useEffect(() => {
        // Get the mete data out of the response
        const meta = data?.meta;

        // We parsed something so now let's check the ranges
        const end = meta?.range[1] ?? null;
        const start = meta?.range[0] ?? null;

        // Handles while we are doing the initial loading
        if (end === null || start === null) {
            return;
        }

        // Set the status as we know when to show information text to user about edge cases
        setReadStatus(meta?.status);

        // This means there was nothing new to fetch and the fetching was skipped
        //  Usually because we are fetching newer logs and there is nothing new written
        if (end === start) {
            setNothingInLastFetch(true);
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
            setDocs([[start, end], documents]);
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
            readStatus,
            refresh: runRefresh,
        }),
        [
            docs,
            error,
            loading,
            newestParsed,
            nothingInLastFetch,
            oldestParsed,
            readStatus,
            runRefresh,
        ]
    );
}

export default useOpsLogs;
