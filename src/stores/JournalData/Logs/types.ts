import { useJournalData } from 'hooks/journals/useJournalData';
import { StoreWithHydration } from 'stores/extensions/Hydration';
import { OpsLogFlowDocument } from 'types';

export interface JournalDataLogsState extends StoreWithHydration {
    documents: OpsLogFlowDocument[] | null;
    setDocuments: (val: JournalDataLogsState['documents']) => void;

    lastCount: number;
    setLastCount: (val: JournalDataLogsState['lastCount']) => void;

    lastParsed: number;
    setLastParsed: (val: JournalDataLogsState['lastParsed']) => void;

    loading: boolean;
    setLoading: (val: JournalDataLogsState['loading']) => void;

    fetchingNewer: boolean;
    setFetchingNewer: (val: JournalDataLogsState['fetchingNewer']) => void;

    fetchingOlder: boolean;
    setFetchingOlder: (val: JournalDataLogsState['fetchingOlder']) => void;

    olderFinished: boolean;
    setOlderFinished: (val: JournalDataLogsState['olderFinished']) => void;

    scrollOnLoad: boolean;
    setScrollOnLoad: (val: JournalDataLogsState['scrollOnLoad']) => void;

    hydrate: (documents: ReturnType<typeof useJournalData>) => void;
}
