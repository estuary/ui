import type { OpsLogFlowDocument } from 'src/types';

import { useCallback, useMemo } from 'react';

import {
    logMatchesFilter,
    MAX_BYTES_SCANNED_WITHOUT_MATCH,
    toFilteredIndex,
    UUID_NEWEST_LOG,
    UUID_OLDEST_LOG,
} from 'src/components/tables/Logs/shared';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

const oldestLogRow: OpsLogFlowDocument = {
    _meta: {
        uuid: UUID_OLDEST_LOG,
    },
    level: 'ui_waiting',
    message: '',
    ts: '',
};

const newestLogRow: OpsLogFlowDocument = {
    _meta: {
        uuid: UUID_NEWEST_LOG,
    },
    level: 'ui_waiting',
    message: '',
    ts: '',
};

// The rows the virtual table renders: the documents that pass the level filter,
//  wrapped in the fake rows that fetch older and newer logs. Filtering happens here
//  and not in the store so new documents never need to be filtered on the way in.
export const useJournalDataLogs_itemData = () => {
    const documents = useJournalDataLogsStore((state) => state.documents);
    const levelFilter = useJournalDataLogsStore((state) => state.levelFilter);

    return useMemo<OpsLogFlowDocument[] | null>(() => {
        if (!documents || documents.length === 0) {
            return null;
        }

        logRocketEvent(CustomEvents.LOGS_DOCUMENT_COUNT, {
            count: documents.length,
        });

        const visible =
            levelFilter === 'all'
                ? documents
                : documents.filter((doc) =>
                      logMatchesFilter(doc.level, levelFilter)
                  );

        return [oldestLogRow, ...visible, newestLogRow];
    }, [documents, levelFilter]);
};

export const useJournalDataLogs_toFilteredIndex = () => {
    const documents = useJournalDataLogsStore((state) => state.documents);
    const levelFilter = useJournalDataLogsStore((state) => state.levelFilter);

    return useCallback(
        (unfilteredIndex: number) =>
            toFilteredIndex(documents, levelFilter, unfilteredIndex),
        [documents, levelFilter]
    );
};

// Timestamp of the oldest loaded line, i.e. how far back the filter has searched
export const useJournalDataLogs_oldestLoadedTs = () =>
    useJournalDataLogsStore((state) => state.documents?.[0]?.ts ?? null);

export const useJournalDataLogs_olderScanPaused = () =>
    useJournalDataLogsStore(
        (state) =>
            state.levelFilter !== 'all' &&
            !state.olderFinished &&
            state.bytesScannedWithoutMatch >= MAX_BYTES_SCANNED_WITHOUT_MATCH
    );
