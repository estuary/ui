import { useZustandStore } from 'src/context/Zustand/provider';
import { GlobalStoreNames } from 'src/stores/names';
import { QueuedTasksStore } from './types';

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
