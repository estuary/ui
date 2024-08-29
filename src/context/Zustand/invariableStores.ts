import { useBindingsEditorStore } from 'components/editor/Bindings/Store/create';
import { createEditorStore } from 'components/editor/Store/create';
import { createExistingEntityStore } from 'components/shared/Entity/ExistingEntityCards/Store/create';
import { createFormStateStore } from 'stores/FormState/Store';
import {
    BindingsEditorStoreNames,
    EditorStoreNames,
    ExistingEntityStoreNames,
    FormStateStoreNames,
    SchemaEvolutionStoreNames,
    SelectTableStoreNames,
    ShardDetailStoreNames,
    TransformCreateStoreNames,
} from 'stores/names';
import { createSchemaEvolutionStore } from 'stores/SchemaEvolution/Store';
import { createShardDetailStore } from 'stores/ShardDetail/Store';
import { createBillingTableStore } from 'stores/Tables/Billing/Store';
import { createPrefixAlertTableStore } from 'stores/Tables/PrefixAlerts/Store';
import { createSelectableTableStore } from 'stores/Tables/Store';
import { createTransformationCreateStore } from 'stores/TransformationCreate/Store';
import { MessagePrefixes } from 'types';

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

    // Existing Entity Store - used only in create workflows
    [ExistingEntityStoreNames.GENERAL]: createExistingEntityStore(
        ExistingEntityStoreNames.GENERAL
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
    [SelectTableStoreNames.COLLECTION_SELECTOR]: createSelectableTableStore(
        SelectTableStoreNames.COLLECTION_SELECTOR
    ),
    [SelectTableStoreNames.CONNECTOR]: createSelectableTableStore(
        SelectTableStoreNames.CONNECTOR
    ),
    [SelectTableStoreNames.MATERIALIZATION]: createSelectableTableStore(
        SelectTableStoreNames.MATERIALIZATION
    ),
    [SelectTableStoreNames.PREFIX_ALERTS]: createPrefixAlertTableStore(
        SelectTableStoreNames.PREFIX_ALERTS
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
