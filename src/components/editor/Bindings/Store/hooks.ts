import { BindingsEditorState } from 'components/editor/Bindings/Store/types';
import { useEntityType } from 'context/EntityContext';
import { useZustandStore } from 'context/Zustand/provider';
import { BindingsEditorStoreNames } from 'stores/names';
import { Entity } from 'types';

// Selector Hooks
const getStoreName = (entityType: Entity): BindingsEditorStoreNames => {
    if (entityType === 'capture' || entityType === 'materialization') {
        return BindingsEditorStoreNames.GENERAL;
    } else {
        throw new Error('Invalid BindingsEditor store name');
    }
};

export const useBindingsEditorStore_collectionData = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['collectionData']
    >(getStoreName(entityType), (state) => state.collectionData);
};

export const useBindingsEditorStore_setCollectionData = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setCollectionData']
    >(getStoreName(entityType), (state) => state.setCollectionData);
};
