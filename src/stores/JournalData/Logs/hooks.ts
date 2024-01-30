import { useZustandStore } from 'context/Zustand/provider';
import { JournalDataStoreNames } from 'stores/names';
import { JournalDataLogsState } from './types';

export const useJournalDataLogsStore_hydrate = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['hydrate']
    >(JournalDataStoreNames.LOGS, (state) => state.hydrate);
};

export const useJournalDataLogsStore_documents = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['documents']
    >(JournalDataStoreNames.LOGS, (state) => state.documents);
};

export const useJournalDataLogsStore_setDocuments = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setDocuments']
    >(JournalDataStoreNames.LOGS, (state) => state.setDocuments);
};

export const useJournalDataLogsStore_setOlderFinished = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setOlderFinished']
    >(JournalDataStoreNames.LOGS, (state) => state.setOlderFinished);
};

export const useJournalDataLogsStore_setLoading = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setLoading']
    >(JournalDataStoreNames.LOGS, (state) => state.setLoading);
};

export const useJournalDataLogsStore_setHydrationErrorsExist = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setHydrationErrorsExist']
    >(JournalDataStoreNames.LOGS, (state) => state.setHydrationErrorsExist);
};

export const useJournalDataLogsStore_setLastParsed = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setLastParsed']
    >(JournalDataStoreNames.LOGS, (state) => state.setLastParsed);
};
