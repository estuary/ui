import { useZustandStore } from 'context/Zustand/provider';
import { JournalDataStoreNames } from 'stores/names';
import { JournalDataLogsState } from './types';

export const useJournalDataLogsStore_hydrate = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['hydrate']
    >(JournalDataStoreNames.LOGS, (state) => state.hydrate);
};

export const useJournalDataLogsStore_hydrated = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['hydrated']
    >(JournalDataStoreNames.LOGS, (state) => state.hydrated);
};

export const useJournalDataLogsStore_hydrationErrorsExist = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['hydrationErrorsExist']
    >(JournalDataStoreNames.LOGS, (state) => state.hydrationErrorsExist);
};

export const useJournalDataLogsStore_documents = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['documents']
    >(JournalDataStoreNames.LOGS, (state) => state.documents);
};

export const useJournalDataLogsStore_addNewDocuments = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['addNewDocuments']
    >(JournalDataStoreNames.LOGS, (state) => state.addNewDocuments);
};

export const useJournalDataLogsStore_fetchMoreLogs = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['fetchMoreLogs']
    >(JournalDataStoreNames.LOGS, (state) => state.fetchMoreLogs);
};

export const useJournalDataLogsStore_setActive = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setActive']
    >(JournalDataStoreNames.LOGS, (state) => state.setActive);
};

export const useJournalDataLogsStore_networkFailed = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['networkFailed']
    >(JournalDataStoreNames.LOGS, (state) => state.networkFailed);
};

export const useJournalDataLogsStore_scrollToWhenDone = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['scrollToWhenDone']
    >(JournalDataStoreNames.LOGS, (state) => state.scrollToWhenDone);
};

export const useJournalDataLogsStore_resetState = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['resetState']
    >(JournalDataStoreNames.LOGS, (state) => state.resetState);
};

export const useJournalDataLogsStore_setAllowFetchingMore = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setAllowFetchingMore']
    >(JournalDataStoreNames.LOGS, (state) => state.setAllowFetchingMore);
};

export const useJournalDataLogsStore_fetchingMore = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['fetchingMore']
    >(JournalDataStoreNames.LOGS, (state) => state.fetchingMore);
};

export const useJournalDataLogsStore_setFetchingMore = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setFetchingMore']
    >(JournalDataStoreNames.LOGS, (state) => state.setFetchingMore);
};

export const useJournalDataLogsStore_tailNewLogs = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['tailNewLogs']
    >(JournalDataStoreNames.LOGS, (state) => state.tailNewLogs);
};

export const useJournalDataLogsStore_setTailNewLogs = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setTailNewLogs']
    >(JournalDataStoreNames.LOGS, (state) => state.setTailNewLogs);
};

export const useJournalDataLogsStore_olderFinished = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['olderFinished']
    >(JournalDataStoreNames.LOGS, (state) => state.olderFinished);
};

export const useJournalDataLogsStore_noData = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['noData']
    >(JournalDataStoreNames.LOGS, (state) => state.noData);
};

export const useJournalDataLogsStore_lastFetchFailed = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['lastFetchFailed']
    >(JournalDataStoreNames.LOGS, (state) => state.lastFetchFailed);
};
