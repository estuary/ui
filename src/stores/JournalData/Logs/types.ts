import { FetchMoreLogsFunction } from 'components/tables/Logs/types';
import { LoadDocumentsOffsets } from 'hooks/journals/shared';
import { Align } from 'react-window';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { OpsLogFlowDocument } from 'types';

export interface JournalDataLogsState extends StoreWithHydration {
    documents: OpsLogFlowDocument[] | null;
    addNewDocuments: (
        val: OpsLogFlowDocument[] | null,
        olderFinished: boolean,
        lastParsed: number
    ) => void;
    markAsReadyToRender: (
        docs: OpsLogFlowDocument[] | null,
        olderFinished: boolean
    ) => void;
    noData: boolean;

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

    tailNewLogs: boolean;
    setTailNewLogs: (val: JournalDataLogsState['tailNewLogs']) => void;

    fetchMoreLogs: FetchMoreLogsFunction;
    allowFetchingMore: boolean;
    setAllowFetchingMore: (
        val: JournalDataLogsState['allowFetchingMore']
    ) => void;

    lastParsed: number;
    lastTopUuid: string | null;
    scrollToWhenDone: [number, Align];

    hydrate: (
        documents: OpsLogFlowDocument[] | null,
        refresh: (newOffset?: LoadDocumentsOffsets) => void,
        olderFinished: boolean,
        lastParsed: number,
        error?: any
    ) => void;
    refresh: ((newOffset?: LoadDocumentsOffsets) => void) | null;
    resetState: () => void;
}
