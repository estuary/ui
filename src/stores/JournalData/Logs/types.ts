import { FetchMoreLogsFunction } from 'components/tables/Logs/types';
import { LoadDocumentsOffsets } from 'hooks/journals/shared';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { OpsLogFlowDocument } from 'types';

export interface JournalDataLogsState extends StoreWithHydration {
    documents: OpsLogFlowDocument[];
    addNewDocuments: (
        val: JournalDataLogsState['documents'],
        olderFinished: boolean,
        lastParsed: number
    ) => void;

    lastCount: number;
    setLastCount: (val: JournalDataLogsState['lastCount']) => void;

    fetchingNewer: boolean;
    setFetchingNewer: (val: JournalDataLogsState['fetchingNewer']) => void;

    fetchingOlder: boolean;
    setFetchingOlder: (val: JournalDataLogsState['fetchingOlder']) => void;

    olderFinished: boolean;
    setOlderFinished: (val: JournalDataLogsState['olderFinished']) => void;

    scrollOnLoad: boolean;
    setScrollOnLoad: (val: JournalDataLogsState['scrollOnLoad']) => void;

    fetchMoreLogs: FetchMoreLogsFunction;
    allowFetchingMore: boolean;
    setAllowFetchingMore: (
        val: JournalDataLogsState['allowFetchingMore']
    ) => void;

    lastParsed: number;
    lastTopUuid: string | null;
    scrollToWhenDone: [number, 'top' | 'bottom' | 'middle'];

    hydrate: (
        documents: OpsLogFlowDocument[],
        refresh: (newOffset?: LoadDocumentsOffsets) => void,
        olderFinished: boolean,
        lastParsed: number,
        error?: any
    ) => void;
    refresh: ((newOffset?: LoadDocumentsOffsets) => void) | null;
    resetState: () => void;
}
