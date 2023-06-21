import { bindingsEditorStore } from 'components/editor/Bindings/Store/create';
import { createEditorStore } from 'components/editor/Store/create';
import { createExistingEntityStore } from 'components/shared/Entity/ExistingEntityCards/Store/create';
import { billingStore } from 'stores/Billing/Store';
import {
    captureDetailsForm,
    collectionDetailsForm,
    materializationDetailsForm,
} from 'stores/DetailsForm/Store';
import { createEndpointConfigStore } from 'stores/EndpointConfig/Store';
import { createEntitiesStore } from 'stores/Entities/Store';
import { createFormStateStore } from 'stores/FormState/Store';
import {
    AdminStoreNames,
    BillingStoreNames,
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
import { createBillingTableStore } from 'stores/Tables/Billing/Store';
import { createSelectableTableStore } from 'stores/Tables/Store';
import { createTopBarStore } from 'stores/TopBar/Store';
import { MessagePrefixes } from 'types';

const invariableStores = {
    // Billing Store
    [BillingStoreNames.GENERAL]: billingStore,

    // Bindings Editor Store
    [BindingsEditorStoreNames.GENERAL]: bindingsEditorStore,

    // Details Form Store
    [DetailsFormStoreNames.CAPTURE]: captureDetailsForm,
    [DetailsFormStoreNames.COLLECTION]: collectionDetailsForm,
    [DetailsFormStoreNames.MATERIALIZATION]: materializationDetailsForm,

    // Specification Editor Store
    [EditorStoreNames.CAPTURE]: createEditorStore(EditorStoreNames.CAPTURE),
    [EditorStoreNames.DERIVATION]: createEditorStore(
        EditorStoreNames.DERIVATION
    ),
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

    // Resource Config Store
    [ResourceConfigStoreNames.GENERAL]: createResourceConfigStore(
        ResourceConfigStoreNames.GENERAL
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
    [GlobalStoreNames.ENTITIES]: createEntitiesStore(GlobalStoreNames.ENTITIES),
    [GlobalStoreNames.SIDE_PANEL_DOCS]: createSidePanelDocsStore(
        GlobalStoreNames.SIDE_PANEL_DOCS
    ),
    [GlobalStoreNames.TOP_BAR]: createTopBarStore(GlobalStoreNames.TOP_BAR),
};

export default invariableStores;
