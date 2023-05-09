import { AlertColor } from '@mui/material';
import { IncompatibleCollections } from 'api/evolutions';
import { CollectionData } from 'components/editor/Bindings/types';
import { Dispatch, SetStateAction } from 'react';
import { Schema } from 'types';

export interface BindingsEditorState {
    collectionData: CollectionData | null | undefined;
    setCollectionData: (value: BindingsEditorState['collectionData']) => void;

    collectionInitializationAlert: null | {
        severity: AlertColor;
        messageId: string;
    };
    setCollectionInitializationAlert: (
        value: BindingsEditorState['collectionInitializationAlert']
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
    schemaInferenceDisabled: boolean;
    setSchemaInferenceDisabled: (
        value: BindingsEditorState['schemaInferenceDisabled']
    ) => void;

    inferredSpec: Schema | null | undefined;
    setInferredSpec: (value: BindingsEditorState['inferredSpec']) => void;

    documentsRead: number | null | undefined;
    setDocumentsRead: (value: BindingsEditorState['documentsRead']) => void;

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
        persistedDraftId: string | null,
        setOpen: Dispatch<SetStateAction<boolean>>
    ) => void;

    // Schema Evolution
    incompatibleCollections: IncompatibleCollections[];
    setIncompatibleCollections: (
        value: BindingsEditorState['incompatibleCollections']
    ) => void;
    hasIncompatibleCollections: boolean;

    // Misc.
    resetState: () => void;
}
