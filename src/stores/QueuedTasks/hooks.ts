import type { QueuedTasksStore } from 'src/stores/QueuedTasks/types';

import { useZustandStore } from 'src/context/Zustand/provider';
import { GlobalStoreNames } from 'src/stores/names';

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
