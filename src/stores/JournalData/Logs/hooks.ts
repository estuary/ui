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

export const useJournalDataLogsStore_refresh = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['refresh']
    >(JournalDataStoreNames.LOGS, (state) => state.refresh);
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
    return useZustandStore<JournalDataLogsState, boolean>(
        JournalDataStoreNames.LOGS,
        (state) => state.fetchingNewer || state.fetchingOlder
    );
};
