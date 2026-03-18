import type { ProtocolStatus } from 'data-plane-gateway/types/gen/broker/protocol/broker';
import type { Align } from 'react-window';
import type { FetchMoreLogsFunction } from 'src/components/tables/Logs/types';
import type {
    LoadDocumentsOffsets,
    UseOpsLogsDocs,
} from 'src/hooks/journals/types';
import type { StoreWithHydration } from 'src/stores/extensions/Hydration';
import type { OpsLogFlowDocument } from 'src/types';

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
        readStatus: ProtocolStatus | undefined,
        error?: any
    ) => void;
    refresh: ((newOffset?: LoadDocumentsOffsets) => void) | null;
    setRefresh: (val: JournalDataLogsState['refresh']) => void;
    resetState: () => void;
}
