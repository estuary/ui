import { JsonFormsCore } from '@jsonforms/core';
import { AlertColor } from '@mui/material';
import { IncompatibleCollections } from 'api/evolutions';
import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import { CollectionData } from 'components/editor/Bindings/types';
import { Dispatch, SetStateAction } from 'react';
import { InferSchemaPropertyForRender, Schema } from 'types';

export interface FullSource {
    name?: string;
    notAfter?: string | null; // controlled by the NotDateTime
    notBefore?: string | null; // controlled by the NotDateTime
    partitions?: any; // not set in the UI today
}

export interface FullSourceJsonForms
    extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: FullSource;
}

export interface FullSourceDictionary {
    [k: string]: FullSourceJsonForms | undefined | null;
}

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
    populateInferSchemaResponse: (
        value: any | undefined,
        entityName: string
    ) => void;

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
    initializeSelections: (
        selection: {
            field: string;
            selectionType: FieldSelectionType | null;
        }[]
    ) => void;
    setSingleSelection: (
        field: string,
        selectionType: FieldSelectionType | null
    ) => void;

    selectionSaving: boolean;
    setSelectionSaving: (value: BindingsEditorState['selectionSaving']) => void;

    // Time Travel
    fullSourceConfigs: FullSourceDictionary;
    removeFullSourceConfig: (collection: string) => void;
    updateFullSourceConfig: (
        collection: string,
        formData: FullSourceJsonForms
    ) => void;
    prefillFullSourceConfigs: (val: any[] | null) => void;
    fullSourceHasErrors: boolean;

    // Misc.
    resetState: (skipFullSource?: boolean) => void;
}
