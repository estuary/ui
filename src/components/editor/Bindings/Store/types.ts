import { AlertColor } from '@mui/material';
import { IncompatibleCollections } from 'api/evolutions';
import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import { CollectionData } from 'components/editor/Bindings/types';
import { Dispatch, SetStateAction } from 'react';
import { InferSchemaPropertyForRender, Schema } from 'types';

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

    // Read/Write mode for collection schema
    editModeEnabled: boolean;
    setEditModeEnabled: (value: BindingsEditorState['editModeEnabled']) => void;

    // Infer Schema used to set the key of a collection
    inferSchemaResponse: InferSchemaPropertyForRender[] | null;
    inferSchemaResponse_Keys: string[];
    inferSchemaResponseError: string | null;
    inferSchemaResponseDoneProcessing: boolean;
    inferSchemaResponseEmpty: boolean;
    populateInferSchemaResponse: (value?: any) => void;

    // Schema Evolution
    incompatibleCollections: IncompatibleCollections[];
    setIncompatibleCollections: (
        value: BindingsEditorState['incompatibleCollections']
    ) => void;
    hasIncompatibleCollections: boolean;

    // Field Selection
    recommendFields: boolean;
    setRecommendFields: (value: BindingsEditorState['recommendFields']) => void;

    selections: { [field: string]: FieldSelectionType | null };
    setSingleSelection: (
        field: string,
        selectionType: FieldSelectionType | null,
        initOnly?: boolean
    ) => void;

    selectionActive: boolean;
    setSelectionActive: (value: BindingsEditorState['selectionActive']) => void;

    selectionSaving: boolean;
    setSelectionSaving: (value: BindingsEditorState['selectionSaving']) => void;

    includedFields: { [field: string]: {} };
    setIncludedFields: (value: BindingsEditorState['includedFields']) => void;

    excludedFields: string[];
    setExcludedFields: (value: BindingsEditorState['excludedFields']) => void;

    // Misc.
    resetState: () => void;
}
