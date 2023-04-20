import { AlertColor } from '@mui/material';
import { CollectionData } from 'components/editor/Bindings/types';
import { Dispatch, SetStateAction } from 'react';
import { Schema } from 'types';

export interface BindingsEditorState {
    applyInferredSchema: (
        currentCollection: string | null,
        persistedDraftId: string | null,
        setOpen: Dispatch<SetStateAction<boolean>>
    ) => void;
    collectionData: CollectionData | null | undefined;

    collectionInitializationAlert: null | {
        messageId: string;
        severity: AlertColor;
    };
    documentsRead: number | null | undefined;

    inferredSchemaApplicationErrored: boolean;

    inferredSpec: Schema | null | undefined;
    loadingInferredSchema: boolean;

    // Misc.
    resetState: () => void;

    // Schema Inference
    schemaInferenceDisabled: boolean;

    schemaUpdateErrored: boolean;
    schemaUpdated: boolean;

    setCollectionData: (value: BindingsEditorState['collectionData']) => void;
    setCollectionInitializationAlert: (
        value: BindingsEditorState['collectionInitializationAlert']
    ) => void;

    setDocumentsRead: (value: BindingsEditorState['documentsRead']) => void;
    setInferredSchemaApplicationErrored: (
        value: BindingsEditorState['inferredSchemaApplicationErrored']
    ) => void;

    setInferredSpec: (value: BindingsEditorState['inferredSpec']) => void;
    setLoadingInferredSchema: (
        value: BindingsEditorState['loadingInferredSchema']
    ) => void;

    setSchemaInferenceDisabled: (
        value: BindingsEditorState['schemaInferenceDisabled']
    ) => void;
    setSchemaUpdateErrored: (
        value: BindingsEditorState['schemaUpdateErrored']
    ) => void;

    setSchemaUpdated: (value: BindingsEditorState['schemaUpdated']) => void;

    // CLI Collection Schema Synchronization
    updateSchema: (
        currentCollection: string | null,
        persistedDraftId: string | null
    ) => Promise<void> | null;
}
