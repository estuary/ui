import type { CollectionSelectorState } from 'src/stores/CollectionSelector/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { persistOptions } from 'src/stores/Tenant/shared';
import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialStateData = (): Pick<
    CollectionSelectorState,
    | 'collectionNameField'
    | 'searchString'
    | 'showNotification'
    | 'notificationMessage'
> => ({
    collectionNameField: 'name',
    notificationMessage: '',
    searchString: '',
    showNotification: false,
});

const getInitialState = (
    set: NamedSet<CollectionSelectorState>
): CollectionSelectorState => ({
    ...getInitialStateData(),

    setCollectionNameField: (value) => {
        set(
            produce((state: CollectionSelectorState) => {
                state.collectionNameField = value;
            }),
            false,
            'Collection Name updated'
        );
    },

    setShowNotification: (value) => {
        set(
            produce((state: CollectionSelectorState) => {
                state.showNotification = value;
            }),
            false,
            'Show Notification updated'
        );
    },

    setNotificationMessage: (value) => {
        set(
            produce((state: CollectionSelectorState) => {
                state.notificationMessage = value;
            }),
            false,
            'Notification Message updated'
        );
    },

    setSearchString: (value) => {
        set(
            produce((state: CollectionSelectorState) => {
                state.searchString = value;
            }),
            false,
            'Search String updated'
        );
    },
});

export const useCollectionSelectorStore = create<CollectionSelectorState>()(
    devtools(
        (set) => getInitialState(set),
        devtoolsOptions(persistOptions.name)
    )
);
