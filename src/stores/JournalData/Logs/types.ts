import { Align } from 'react-window';

import { FetchMoreLogsFunction } from 'src/components/tables/Logs/types';
import { LoadDocumentsOffsets, UseOpsLogsDocs } from 'src/hooks/journals/types';
import { StoreWithHydration } from 'src/stores/extensions/Hydration';
import { OpsLogFlowDocument } from 'src/types';

export interface JournalDataLogsState extends StoreWithHydration {
    documents: OpsLogFlowDocument[] | null;
    addNewDocuments: (documents: UseOpsLogsDocs, error?: any) => void;
    noData: boolean;

    lastCount: number;
    setLastCount: (val: JournalDataLogsState['lastCount']) => void;

    fetchingMore: boolean;
    setFetchingMore: (val: JournalDataLogsState['fetchingMore']) => void;

    olderFinished: boolean;
    setOlderFinished: (val: JournalDataLogsState['olderFinished']) => void;

    tailNewLogs: boolean;
    setTailNewLogs: (val: JournalDataLogsState['tailNewLogs']) => void;

    fetchMoreLogs: FetchMoreLogsFunction;
    allowFetchingMore: boolean;
    lastFetchFailed: boolean;
    setAllowFetchingMore: (
        val: JournalDataLogsState['allowFetchingMore']
    ) => void;

    newestParsed: number;
    oldestParsed: number;
    lastTopUuid: string | null;
    scrollToWhenDone: [number, Align];

    hydrate: (
        documents: UseOpsLogsDocs,
        refresh: (newOffset?: LoadDocumentsOffsets) => void,
        error?: any
    ) => void;
    refresh: ((newOffset?: LoadDocumentsOffsets) => void) | null;
    setRefresh: (val: JournalDataLogsState['refresh']) => void;
    resetState: () => void;
}
