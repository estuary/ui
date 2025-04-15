import type { CollectionNameKeys } from 'src/components/collection/Selector/types';

export interface CollectionSelectorState {
    collectionNameField: CollectionNameKeys;
    setCollectionNameField: (newVal: CollectionNameKeys) => void;

    searchString: string;
    setSearchString: (newVal: string) => void;

    showNotification: boolean;
    setShowNotification: (newVal: boolean) => void;

    notificationMessage: string;
    setNotificationMessage: (newVal: string) => void;
}
