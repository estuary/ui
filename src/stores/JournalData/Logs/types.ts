import { FetchMoreLogsFunction } from 'components/tables/Logs/types';
import {
    AddingLogTypes,
    LoadDocumentsOffsets,
    UseOpsLogsDocs,
} from 'hooks/journals/shared';
import { Align } from 'react-window';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { OpsLogFlowDocument } from 'types';

export interface JournalDataLogsState extends StoreWithHydration {
    documents: OpsLogFlowDocument[] | null;
    addNewDocuments: (
        typeOfAdd: AddingLogTypes,
        val: OpsLogFlowDocument[] | null,
        olderFinished: boolean,
        lastParsed: number,
        error?: any
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

    tailNewLogs: boolean;
    setTailNewLogs: (val: JournalDataLogsState['tailNewLogs']) => void;

    fetchMoreLogs: FetchMoreLogsFunction;
    allowFetchingMore: boolean;
    lastFetchFailed: boolean;
    setAllowFetchingMore: (
        val: JournalDataLogsState['allowFetchingMore']
    ) => void;

    lastParsed: number;
    lastTopUuid: string | null;
    scrollToWhenDone: [number, Align];

    hydrate: (
        documents: UseOpsLogsDocs,
        refresh: (newOffset?: LoadDocumentsOffsets) => void,
        olderFinished: boolean,
        lastParsed: number,
        error?: any
    ) => void;
    refresh: ((newOffset?: LoadDocumentsOffsets) => void) | null;
    setRefresh: (val: JournalDataLogsState['refresh']) => void;
    resetState: () => void;
}
