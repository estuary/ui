import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';

export const useBindingsEditorStore_collectionData = () => {
    return useBindingsEditorStore((state) => state.collectionData);
};

export const useBindingsEditorStore_setCollectionData = () => {
    return useBindingsEditorStore((state) => state.setCollectionData);
};

export const useBindingsEditorStore_collectionInitializationAlert = () => {
    return useBindingsEditorStore(
        (state) => state.collectionInitializationAlert
    );
};

export const useBindingsEditorStore_setCollectionInitializationAlert = () => {
    return useBindingsEditorStore(
        (state) => state.setCollectionInitializationAlert
    );
};

export const useBindingsEditorStore_updateSchema = () => {
    return useBindingsEditorStore((state) => state.updateSchema);
};

export const useBindingsEditorStore_schemaUpdating = () => {
    return useBindingsEditorStore((state) => state.schemaUpdating);
};

export const useBindingsEditorStore_schemaUpdated = () => {
    return useBindingsEditorStore((state) => state.schemaUpdated);
};

export const useBindingsEditorStore_schemaUpdateErrored = () => {
    return useBindingsEditorStore((state) => state.schemaUpdateErrored);
};

export const useBindingsEditorStore_setSchemaUpdateErrored = () => {
    return useBindingsEditorStore((state) => state.setSchemaUpdateErrored);
};

export const useBindingsEditorStore_incompatibleCollections = () => {
    return useBindingsEditorStore((state) => state.incompatibleCollections);
};

export const useBindingsEditorStore_hasIncompatibleCollections = () => {
    return useBindingsEditorStore((state) => state.hasIncompatibleCollections);
};

export const useBindingsEditorStore_setIncompatibleCollections = () => {
    return useBindingsEditorStore((state) => state.setIncompatibleCollections);
};

export const useBindingsEditorStore_editModeEnabled = () => {
    return useBindingsEditorStore((state) => state.editModeEnabled);
};

export const useBindingsEditorStore_setEditModeEnabled = () => {
    return useBindingsEditorStore((state) => state.setEditModeEnabled);
};

export const useBindingsEditorStore_inferSchemaResponse = () => {
    return useBindingsEditorStore((state) => state.inferSchemaResponse);
};

export const useBindingsEditorStore_inferSchemaResponse_Keys = () => {
    return useBindingsEditorStore((state) => state.inferSchemaResponse_Keys);
};

export const useBindingsEditorStore_inferSchemaResponseDoneProcessing = () => {
    return useBindingsEditorStore(
        (state) => state.inferSchemaResponseDoneProcessing
    );
};

export const useBindingsEditorStore_inferSchemaResponseEmpty = () => {
    return useBindingsEditorStore((state) => state.inferSchemaResponseEmpty);
};

export const useBindingsEditorStore_inferSchemaResponseError = () => {
    return useBindingsEditorStore((state) => state.inferSchemaResponseError);
};

export const useBindingsEditorStore_populateInferSchemaResponse = () => {
    return useBindingsEditorStore((state) => state.populateInferSchemaResponse);
};

export const useBindingsEditorStore_resetState = () => {
    return useBindingsEditorStore((state) => state.resetState);
};
