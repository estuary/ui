import { BindingsEditorState } from 'components/editor/Bindings/Store/types';
import { useZustandStore } from 'context/Zustand/provider';
import { BindingsEditorStoreNames } from 'stores/names';

// Selector Hooks
export const useBindingsEditorStore_collectionData = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['collectionData']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.collectionData);
};

export const useBindingsEditorStore_setCollectionData = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setCollectionData']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.setCollectionData);
};

export const useBindingsEditorStore_collectionInitializationAlert = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['collectionInitializationAlert']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.collectionInitializationAlert
    );
};

export const useBindingsEditorStore_setCollectionInitializationAlert = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setCollectionInitializationAlert']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.setCollectionInitializationAlert
    );
};

export const useBindingsEditorStore_schemaInferenceDisabled = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['schemaInferenceDisabled']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.schemaInferenceDisabled
    );
};

export const useBindingsEditorStore_setSchemaInferenceDisabled = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setSchemaInferenceDisabled']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.setSchemaInferenceDisabled
    );
};

export const useBindingsEditorStore_inferredSpec = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['inferredSpec']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.inferredSpec);
};

export const useBindingsEditorStore_setInferredSpec = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setInferredSpec']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.setInferredSpec);
};

export const useBindingsEditorStore_documentsRead = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['documentsRead']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.documentsRead);
};

export const useBindingsEditorStore_setDocumentsRead = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setDocumentsRead']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.setDocumentsRead);
};

export const useBindingsEditorStore_loadingInferredSchema = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['loadingInferredSchema']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.loadingInferredSchema);
};

export const useBindingsEditorStore_setLoadingInferredSchema = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setLoadingInferredSchema']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.setLoadingInferredSchema
    );
};

export const useBindingsEditorStore_inferredSchemaApplicationErrored = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['inferredSchemaApplicationErrored']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.inferredSchemaApplicationErrored
    );
};

export const useBindingsEditorStore_setInferredSchemaApplicationErrored =
    () => {
        return useZustandStore<
            BindingsEditorState,
            BindingsEditorState['setInferredSchemaApplicationErrored']
        >(
            BindingsEditorStoreNames.GENERAL,
            (state) => state.setInferredSchemaApplicationErrored
        );
    };

export const useBindingsEditorStore_applyInferredSchema = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['applyInferredSchema']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.applyInferredSchema);
};

export const useBindingsEditorStore_updateSchema = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['updateSchema']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.updateSchema);
};

export const useBindingsEditorStore_schemaUpdated = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['schemaUpdated']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.schemaUpdated);
};

export const useBindingsEditorStore_setSchemaUpdated = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setSchemaUpdated']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.setSchemaUpdated);
};

export const useBindingsEditorStore_schemaUpdateErrored = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['schemaUpdateErrored']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.schemaUpdateErrored);
};

export const useBindingsEditorStore_setSchemaUpdateErrored = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setSchemaUpdateErrored']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.setSchemaUpdateErrored
    );
};

export const useBindingsEditorStore_incompatibleCollections = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['incompatibleCollections']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.incompatibleCollections
    );
};

export const useBindingsEditorStore_hasIncompatibleCollections = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['hasIncompatibleCollections']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.hasIncompatibleCollections
    );
};

export const useBindingsEditorStore_setIncompatibleCollections = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setIncompatibleCollections']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.setIncompatibleCollections
    );
};

export const useBindingsEditorStore_editModeEnabled = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['editModeEnabled']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.editModeEnabled);
};

export const useBindingsEditorStore_setEditModeEnabled = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setEditModeEnabled']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.setEditModeEnabled);
};

export const useBindingsEditorStore_inferSchemaResponse = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['inferSchemaResponse']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.inferSchemaResponse);
};

export const useBindingsEditorStore_inferSchemaResponse_Keys = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['inferSchemaResponse_Keys']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.inferSchemaResponse_Keys
    );
};

export const useBindingsEditorStore_inferSchemaResponseDoneProcessing = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['inferSchemaResponseDoneProcessing']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.inferSchemaResponseDoneProcessing
    );
};

export const useBindingsEditorStore_inferSchemaResponseEmpty = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['inferSchemaResponseEmpty']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.inferSchemaResponseEmpty
    );
};

export const useBindingsEditorStore_inferSchemaResponseError = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['inferSchemaResponseError']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.inferSchemaResponseError
    );
};

export const useBindingsEditorStore_populateInferSchemaResponse = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['populateInferSchemaResponse']
    >(
        BindingsEditorStoreNames.GENERAL,
        (state) => state.populateInferSchemaResponse
    );
};

export const useBindingsEditorStore_resetState = () => {
    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['resetState']
    >(BindingsEditorStoreNames.GENERAL, (state) => state.resetState);
};
