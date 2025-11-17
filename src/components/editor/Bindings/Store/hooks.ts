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

export const useBindingsEditorStore_skimProjectionResponse = () => {
    return useBindingsEditorStore((state) => state.skimProjectionResponse);
};

export const useBindingsEditorStore_skimProjectionResponse_Keys = () => {
    return useBindingsEditorStore((state) => state.skimProjectionResponse_Keys);
};

export const useBindingsEditorStore_skimProjectionResponseDoneProcessing =
    () => {
        return useBindingsEditorStore(
            (state) => state.skimProjectionResponseDoneProcessing
        );
    };

export const useBindingsEditorStore_skimProjectionResponseEmpty = () => {
    return useBindingsEditorStore((state) => state.skimProjectionResponseEmpty);
};

export const useBindingsEditorStore_skimProjectionResponseError = () => {
    return useBindingsEditorStore((state) => state.skimProjectionResponseError);
};

export const useBindingsEditorStore_populateSkimProjectionResponse = () => {
    return useBindingsEditorStore(
        (state) => state.populateSkimProjectionResponse
    );
};

export const useBindingsEditorStore_resetState = () => {
    return useBindingsEditorStore((state) => state.resetState);
};
