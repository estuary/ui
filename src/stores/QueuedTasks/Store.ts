import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import { create } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { GlobalStoreNames } from '../names';
import { QueuedTasksStore } from './types';

const getInitialStateData = (): Pick<
    QueuedTasksStore,
    'publications' | 'publicationQuery'
> => ({
    publicationQuery: null,
    publications: {},
});

const getInitialState = (
    set: NamedSet<QueuedTasksStore>
    // get: StoreApi<SidePanelDocsState>['getState']
): QueuedTasksStore => ({
    ...getInitialStateData(),

    addPublication: (val) => {
        set(
            produce((state: QueuedTasksStore) => {
                state.publications[val] = null;
            }),
            false,
            'Publication added to Queued Tasks'
        );
    },

    setPublicationQuery: (val) => {
        set(
            produce((state: QueuedTasksStore) => {
                state.publicationQuery = val;
            }),
            false,
            'Publication Query set for Queued Tasks'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Queued Tasks State Reset');
    },
});

export const createQueuesTasksStore = (key: GlobalStoreNames) => {
    return create<QueuedTasksStore>()(
        devtools((set, _get) => getInitialState(set), devtoolsOptions(key))
    );
};
