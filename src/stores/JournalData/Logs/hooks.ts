import { useZustandStore } from 'context/Zustand/provider';
import { JournalDataStoreNames } from 'stores/names';
import { JournalDataLogsState } from './types';

export const useJournalDataLogsStore_hydrate = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['hydrate']
    >(JournalDataStoreNames.LOGS, (state) => state.hydrate);
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

export const useJournalDataLogsStore_documentCount = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['documentCount']
    >(JournalDataStoreNames.LOGS, (state) => state.documentCount);
};

export const useJournalDataLogsStore_lastParsed = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['lastParsed']
    >(JournalDataStoreNames.LOGS, (state) => state.lastParsed);
};

export const useJournalDataLogsStore_loading = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['loading']
    >(JournalDataStoreNames.LOGS, (state) => state.loading);
};

export const useJournalDataLogsStore_setLoading = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setLoading']
    >(JournalDataStoreNames.LOGS, (state) => state.setLoading);
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

export const useJournalDataLogsStore_olderFinished = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['olderFinished']
    >(JournalDataStoreNames.LOGS, (state) => state.olderFinished);
};

export const useJournalDataLogsStore_fetchingOlder = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['fetchingOlder']
    >(JournalDataStoreNames.LOGS, (state) => state.fetchingOlder);
};

export const useJournalDataLogsStore_setFetchingOlder = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setFetchingOlder']
    >(JournalDataStoreNames.LOGS, (state) => state.setFetchingOlder);
};

export const useJournalDataLogsStore_fetchingNewer = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['fetchingNewer']
    >(JournalDataStoreNames.LOGS, (state) => state.fetchingNewer);
};

export const useJournalDataLogsStore_setFetchingNewer = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setFetchingNewer']
    >(JournalDataStoreNames.LOGS, (state) => state.setFetchingNewer);
};

export const useJournalDataLogsStore_lastTimeCheckedForNew = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['lastTimeCheckedForNew']
    >(JournalDataStoreNames.LOGS, (state) => state.lastTimeCheckedForNew);
};

export const useJournalDataLogsStore_setLastTimeCheckedForNew = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['setLastTimeCheckedForNew']
    >(JournalDataStoreNames.LOGS, (state) => state.setLastTimeCheckedForNew);
};

export const useJournalDataLogsStore_resetState = () => {
    return useZustandStore<
        JournalDataLogsState,
        JournalDataLogsState['resetState']
    >(JournalDataStoreNames.LOGS, (state) => state.resetState);
};
