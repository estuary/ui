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

export const useBindingsEditorStore_initializeCollectionData = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['initializeCollectionData']
    >(getStoreName(entityType), (state) => state.initializeCollectionData);
};

export const useBindingsEditorStore_inferredSpec = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['inferredSpec']
    >(getStoreName(entityType), (state) => state.inferredSpec);
};

export const useBindingsEditorStore_setInferredSpec = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setInferredSpec']
    >(getStoreName(entityType), (state) => state.setInferredSpec);
};

export const useBindingsEditorStore_documentsRead = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['documentsRead']
    >(getStoreName(entityType), (state) => state.documentsRead);
};

export const useBindingsEditorStore_setDocumentsRead = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setDocumentsRead']
    >(getStoreName(entityType), (state) => state.setDocumentsRead);
};

export const useBindingsEditorStore_loadingInferredSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['loadingInferredSchema']
    >(getStoreName(entityType), (state) => state.loadingInferredSchema);
};

export const useBindingsEditorStore_setLoadingInferredSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setLoadingInferredSchema']
    >(getStoreName(entityType), (state) => state.setLoadingInferredSchema);
};

export const useBindingsEditorStore_inferredSchemaApplicationErrored = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['inferredSchemaApplicationErrored']
    >(
        getStoreName(entityType),
        (state) => state.inferredSchemaApplicationErrored
    );
};

export const useBindingsEditorStore_setInferredSchemaApplicationErrored =
    () => {
        const entityType = useEntityType();

        return useZustandStore<
            BindingsEditorState,
            BindingsEditorState['setInferredSchemaApplicationErrored']
        >(
            getStoreName(entityType),
            (state) => state.setInferredSchemaApplicationErrored
        );
    };

export const useBindingsEditorStore_applyInferredSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['applyInferredSchema']
    >(getStoreName(entityType), (state) => state.applyInferredSchema);
};

export const useBindingsEditorStore_updateSchema = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['updateSchema']
    >(getStoreName(entityType), (state) => state.updateSchema);
};

export const useBindingsEditorStore_schemaUpdated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['schemaUpdated']
    >(getStoreName(entityType), (state) => state.schemaUpdated);
};

export const useBindingsEditorStore_setSchemaUpdated = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setSchemaUpdated']
    >(getStoreName(entityType), (state) => state.setSchemaUpdated);
};

export const useBindingsEditorStore_schemaUpdateErrored = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['schemaUpdateErrored']
    >(getStoreName(entityType), (state) => state.schemaUpdateErrored);
};

export const useBindingsEditorStore_setSchemaUpdateErrored = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['setSchemaUpdateErrored']
    >(getStoreName(entityType), (state) => state.setSchemaUpdateErrored);
};

export const useBindingsEditorStore_resetState = () => {
    const entityType = useEntityType();

    return useZustandStore<
        BindingsEditorState,
        BindingsEditorState['resetState']
    >(getStoreName(entityType), (state) => state.resetState);
};
