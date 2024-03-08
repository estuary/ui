import { useBindingsEditorStore } from './create';

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

export const useBindingsEditorStore_schemaInferenceDisabled = () => {
    return useBindingsEditorStore((state) => state.schemaInferenceDisabled);
};

export const useBindingsEditorStore_setSchemaInferenceDisabled = () => {
    return useBindingsEditorStore((state) => state.setSchemaInferenceDisabled);
};

export const useBindingsEditorStore_inferredSpec = () => {
    return useBindingsEditorStore((state) => state.inferredSpec);
};

export const useBindingsEditorStore_setInferredSpec = () => {
    return useBindingsEditorStore((state) => state.setInferredSpec);
};

export const useBindingsEditorStore_documentsRead = () => {
    return useBindingsEditorStore((state) => state.documentsRead);
};

export const useBindingsEditorStore_setDocumentsRead = () => {
    return useBindingsEditorStore((state) => state.setDocumentsRead);
};

export const useBindingsEditorStore_loadingInferredSchema = () => {
    return useBindingsEditorStore((state) => state.loadingInferredSchema);
};

export const useBindingsEditorStore_setLoadingInferredSchema = () => {
    return useBindingsEditorStore((state) => state.setLoadingInferredSchema);
};

export const useBindingsEditorStore_inferredSchemaApplicationErrored = () => {
    return useBindingsEditorStore(
        (state) => state.inferredSchemaApplicationErrored
    );
};

export const useBindingsEditorStore_setInferredSchemaApplicationErrored =
    () => {
        return useBindingsEditorStore(
            (state) => state.setInferredSchemaApplicationErrored
        );
    };

export const useBindingsEditorStore_applyInferredSchema = () => {
    return useBindingsEditorStore((state) => state.applyInferredSchema);
};

export const useBindingsEditorStore_updateSchema = () => {
    return useBindingsEditorStore((state) => state.updateSchema);
};

export const useBindingsEditorStore_schemaUpdated = () => {
    return useBindingsEditorStore((state) => state.schemaUpdated);
};

export const useBindingsEditorStore_setSchemaUpdated = () => {
    return useBindingsEditorStore((state) => state.setSchemaUpdated);
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
