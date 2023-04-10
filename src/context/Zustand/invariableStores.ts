import { createBindingsEditorStore } from 'components/editor/Bindings/Store/create';
import { createEditorStore } from 'components/editor/Store/create';
import { createExistingEntityStore } from 'components/shared/Entity/ExistingEntityCards/Store/create';
import { createDetailsFormStore } from 'stores/DetailsForm/Store';
import { createEndpointConfigStore } from 'stores/EndpointConfig/Store';
import { createFormStateStore } from 'stores/FormState/Store';
import {
    AdminStoreNames,
    BindingsEditorStoreNames,
    DetailsFormStoreNames,
    EditorStoreNames,
    EndpointConfigStoreNames,
    ExistingEntityStoreNames,
    FormStateStoreNames,
    GlobalStoreNames,
    ResourceConfigStoreNames,
    SelectTableStoreNames,
    ShardDetailStoreNames,
} from 'stores/names';
import { createResourceConfigStore } from 'stores/ResourceConfig/Store';
import { createShardDetailStore } from 'stores/ShardDetail/Store';
import { createSidePanelDocsStore } from 'stores/SidePanelDocs/Store';
import { createStorageMappingsStore } from 'stores/StorageMappings/Store';
import { createBillingStore } from 'stores/Tables/Billing/Store';
import { createSelectableTableStore } from 'stores/Tables/Store';
import { MessagePrefixes } from 'types';

const invariableStores = {
    // Bindings Editor Store
    [BindingsEditorStoreNames.GENERAL]: createBindingsEditorStore(
        BindingsEditorStoreNames.GENERAL
    ),

    // Details Form Store
    [DetailsFormStoreNames.CAPTURE]: createDetailsFormStore(
        DetailsFormStoreNames.CAPTURE
    ),
    [DetailsFormStoreNames.MATERIALIZATION]: createDetailsFormStore(
        DetailsFormStoreNames.MATERIALIZATION
    ),

    // Specification Editor Store
    [EditorStoreNames.CAPTURE]: createEditorStore(EditorStoreNames.CAPTURE),
    [EditorStoreNames.MATERIALIZATION]: createEditorStore(
        EditorStoreNames.MATERIALIZATION
    ),

    // Endpoint Config Store
    [EndpointConfigStoreNames.GENERAL]: createEndpointConfigStore(
        EndpointConfigStoreNames.GENERAL
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
    [FormStateStoreNames.MATERIALIZATION_CREATE]: createFormStateStore(
        FormStateStoreNames.MATERIALIZATION_CREATE,
        MessagePrefixes.MATERIALIZATION_CREATE
    ),
    [FormStateStoreNames.MATERIALIZATION_EDIT]: createFormStateStore(
        FormStateStoreNames.MATERIALIZATION_EDIT,
        MessagePrefixes.MATERIALIZATION_EDIT
    ),

    // Resource Config Store
    [ResourceConfigStoreNames.GENERAL]: createResourceConfigStore(
        ResourceConfigStoreNames.GENERAL
    ),

    // Select Table Store
    [SelectTableStoreNames.ACCESS_GRANTS_PREFIXES]: createSelectableTableStore(
        SelectTableStoreNames.ACCESS_GRANTS_PREFIXES
    ),
    [SelectTableStoreNames.ACCESS_GRANTS_USERS]: createSelectableTableStore(
        SelectTableStoreNames.ACCESS_GRANTS_USERS
    ),
    [SelectTableStoreNames.CAPTURE]: createSelectableTableStore(
        SelectTableStoreNames.CAPTURE
    ),
    [SelectTableStoreNames.BILLING]: createBillingStore(
        SelectTableStoreNames.BILLING
    ),
    [SelectTableStoreNames.COLLECTION]: createSelectableTableStore(
        SelectTableStoreNames.COLLECTION
    ),
    [SelectTableStoreNames.CONNECTOR]: createSelectableTableStore(
        SelectTableStoreNames.CONNECTOR
    ),
    [SelectTableStoreNames.MATERIALIZATION]: createSelectableTableStore(
        SelectTableStoreNames.MATERIALIZATION
    ),

    // Shard Detail Store
    [ShardDetailStoreNames.CAPTURE]: createShardDetailStore(
        ShardDetailStoreNames.CAPTURE,
        'capture'
    ),
    [ShardDetailStoreNames.MATERIALIZATION]: createShardDetailStore(
        ShardDetailStoreNames.MATERIALIZATION,
        'materialization'
    ),
    [ShardDetailStoreNames.COLLECTION]: createShardDetailStore(
        ShardDetailStoreNames.COLLECTION,
        'collection'
    ),
    [SelectTableStoreNames.STORAGE_MAPPINGS]: createSelectableTableStore(
        SelectTableStoreNames.STORAGE_MAPPINGS
    ),

    // Admin Storage Mappings
    [AdminStoreNames.STORAGE_MAPPINGS]: createStorageMappingsStore(
        AdminStoreNames.STORAGE_MAPPINGS
    ),

    // Transformation Create
    // TODO (transform create)
    // [TransformCreateStoreNames.TRANSFORM_CREATE]:
    //     createTransformationCreateStore(
    //         TransformCreateStoreNames.TRANSFORM_CREATE
    //     ),

    // Global App Stores
    [GlobalStoreNames.SIDE_PANEL_DOCS]: createSidePanelDocsStore(
        GlobalStoreNames.SIDE_PANEL_DOCS
    ),
};

export default invariableStores;
