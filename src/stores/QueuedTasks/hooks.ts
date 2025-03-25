import type { QueuedTasksStore } from './types';
import { useZustandStore } from 'context/Zustand/provider';
import { GlobalStoreNames } from 'stores/names';

export const useQueuedTasksStore_publications = () => {
    return useZustandStore<QueuedTasksStore, QueuedTasksStore['publications']>(
        GlobalStoreNames.QUEUED_TASKS,
        (state) => state.publications
    );
};

export const useQueuedTasksStore_addPublication = () => {
    return useZustandStore<
        QueuedTasksStore,
        QueuedTasksStore['addPublication']
    >(GlobalStoreNames.QUEUED_TASKS, (state) => state.addPublication);
};
