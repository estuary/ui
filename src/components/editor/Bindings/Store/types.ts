import { CollectionData } from 'components/editor/Bindings/types';
import { Schema } from 'types';

export interface BindingsEditorState {
    collectionData: CollectionData | null | undefined;
    setCollectionData: (value: BindingsEditorState['collectionData']) => void;
    initializeCollectionData: (
        currentCollection: string | null,
        persistedDraftId: string | null
    ) => void;

    // CLI Collection Schema Synchronization
    updateSchema: (
        currentCollection: string | null,
        persistedDraftId: string | null
    ) => Promise<void> | null;

    schemaUpdated: boolean;
    setSchemaUpdated: (value: BindingsEditorState['schemaUpdated']) => void;

    schemaUpdateErrored: boolean;
    setSchemaUpdateErrored: (
        value: BindingsEditorState['schemaUpdateErrored']
    ) => void;

    // Schema Inference
    inferredSpec: Schema | null | undefined;
    setInferredSpec: (value: BindingsEditorState['inferredSpec']) => void;

    loadingInferredSchema: boolean;
    setLoadingInferredSchema: (
        value: BindingsEditorState['loadingInferredSchema']
    ) => void;

    inferredSchemaApplicationErrored: boolean;
    setInferredSchemaApplicationErrored: (
        value: BindingsEditorState['inferredSchemaApplicationErrored']
    ) => void;

    applyInferredSchema: (
        currentCollection: string | null,
        persistedDraftId: string | null
    ) => void;

    // Misc.
    resetState: () => void;
}
