import type { AlertColor } from '@mui/material';
import type { CollectionData } from 'src/components/editor/Bindings/types';
import type { IncompatibleCollections } from 'src/components/shared/Entity/IncompatibleCollections/types';
import type { InferSchemaPropertyForRender } from 'src/types';
import type { CollectionSchema } from 'src/types/schemaModels';

export interface BindingsEditorState {
    collectionData: CollectionData | null | undefined;
    setCollectionData: (value: BindingsEditorState['collectionData']) => void;

    schemaProperties: CollectionSchema;

    collectionInitializationDone: boolean;
    setCollectionInitializationDone: (
        value: BindingsEditorState['collectionInitializationDone']
    ) => void;

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

    schemaUpdating: boolean;
    setSchemaUpdating: (value: BindingsEditorState['schemaUpdating']) => void;

    schemaUpdated: boolean;
    setSchemaUpdated: (value: BindingsEditorState['schemaUpdated']) => void;

    schemaUpdateErrored: boolean;
    setSchemaUpdateErrored: (
        value: BindingsEditorState['schemaUpdateErrored']
    ) => void;

    // Read/Write mode for collection schema
    editModeEnabled: boolean;
    setEditModeEnabled: (value: BindingsEditorState['editModeEnabled']) => void;

    // Infer Schema used to set the key of a collection
    hasReadAndWriteSchema: boolean | null;
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

    // Misc.
    resetState: (skipFullSource?: boolean) => void;
}
