import { useBindingsEditorStore } from 'src/components/editor/Bindings/Store/create';
import { createEditorStore } from 'src/components/editor/Store/create';
import { createFormStateStore } from 'src/stores/FormState/Store';
import {
    BindingsEditorStoreNames,
    EditorStoreNames,
    FormStateStoreNames,
    SchemaEvolutionStoreNames,
    SelectTableStoreNames,
    ShardDetailStoreNames,
    TransformCreateStoreNames,
} from 'src/stores/names';
import { createSchemaEvolutionStore } from 'src/stores/SchemaEvolution/Store';
import { createShardDetailStore } from 'src/stores/ShardDetail/Store';
import { createBillingTableStore } from 'src/stores/Tables/Billing/Store';
import { createSelectableTableStore } from 'src/stores/Tables/Store';
import { createTransformationCreateStore } from 'src/stores/TransformationCreate/Store';
import { MessagePrefixes } from 'src/types';

const invariableStores = {
    // Bindings Editor Store
    [BindingsEditorStoreNames.GENERAL]: useBindingsEditorStore,

    // Specification Editor Store
    [EditorStoreNames.CAPTURE]: createEditorStore(EditorStoreNames.CAPTURE),
    [EditorStoreNames.DERIVATION]: createEditorStore(
        EditorStoreNames.DERIVATION
    ),
    [EditorStoreNames.MATERIALIZATION]: createEditorStore(
        EditorStoreNames.MATERIALIZATION
    ),

    // Form State Store
    [FormStateStoreNames.CAPTURE_CREATE]: createFormStateStore(
        FormStateStoreNames.CAPTURE_CREATE,
        MessagePrefixes.CAPTURE_CREATE
    ),
    [FormStateStoreNames.CAPTURE_EDIT]: createFormStateStore(
        FormStateStoreNames.CAPTURE_EDIT,
        MessagePrefixes.CAPTURE_EDIT
    ),
    [FormStateStoreNames.COLLECTION_CREATE]: createFormStateStore(
        FormStateStoreNames.COLLECTION_CREATE,
        MessagePrefixes.COLLECTION_CREATE
    ),
    [FormStateStoreNames.MATERIALIZATION_CREATE]: createFormStateStore(
        FormStateStoreNames.MATERIALIZATION_CREATE,
        MessagePrefixes.MATERIALIZATION_CREATE
    ),
    [FormStateStoreNames.MATERIALIZATION_EDIT]: createFormStateStore(
        FormStateStoreNames.MATERIALIZATION_EDIT,
        MessagePrefixes.MATERIALIZATION_EDIT
    ),

    // Schema Evolution Store
    [SchemaEvolutionStoreNames.GENERAL]: createSchemaEvolutionStore(
        SchemaEvolutionStoreNames.GENERAL
    ),

    // Select Table Store
    [SelectTableStoreNames.ACCESS_GRANTS_LINKS]: createSelectableTableStore(
        SelectTableStoreNames.ACCESS_GRANTS_LINKS
    ),
    [SelectTableStoreNames.ACCESS_GRANTS_PREFIXES]: createSelectableTableStore(
        SelectTableStoreNames.ACCESS_GRANTS_PREFIXES
    ),
    [SelectTableStoreNames.ACCESS_GRANTS_USERS]: createSelectableTableStore(
        SelectTableStoreNames.ACCESS_GRANTS_USERS
    ),
    [SelectTableStoreNames.BILLING]: createBillingTableStore(
        SelectTableStoreNames.BILLING
    ),
    [SelectTableStoreNames.CAPTURE]: createSelectableTableStore(
        SelectTableStoreNames.CAPTURE
    ),
    [SelectTableStoreNames.COLLECTION]: createSelectableTableStore(
        SelectTableStoreNames.COLLECTION
    ),
    [SelectTableStoreNames.DATA_PLANE]: createSelectableTableStore(
        SelectTableStoreNames.DATA_PLANE
    ),
    [SelectTableStoreNames.ENTITY_SELECTOR]: createSelectableTableStore(
        SelectTableStoreNames.ENTITY_SELECTOR
    ),
    [SelectTableStoreNames.CONNECTOR]: createSelectableTableStore(
        SelectTableStoreNames.CONNECTOR
    ),
    [SelectTableStoreNames.MATERIALIZATION]: createSelectableTableStore(
        SelectTableStoreNames.MATERIALIZATION
    ),
    [SelectTableStoreNames.REFRESH_TOKENS]: createSelectableTableStore(
        SelectTableStoreNames.REFRESH_TOKENS
    ),

    // Shard Detail Store
    [ShardDetailStoreNames.CAPTURE]: createShardDetailStore(
        ShardDetailStoreNames.CAPTURE
    ),
    [ShardDetailStoreNames.MATERIALIZATION]: createShardDetailStore(
        ShardDetailStoreNames.MATERIALIZATION
    ),
    [ShardDetailStoreNames.COLLECTION]: createShardDetailStore(
        ShardDetailStoreNames.COLLECTION
    ),
    [SelectTableStoreNames.STORAGE_MAPPINGS]: createSelectableTableStore(
        SelectTableStoreNames.STORAGE_MAPPINGS
    ),

    // Transformation Create
    [TransformCreateStoreNames.TRANSFORM_CREATE]:
        createTransformationCreateStore(
            TransformCreateStoreNames.TRANSFORM_CREATE
        ),
};

export default invariableStores;
