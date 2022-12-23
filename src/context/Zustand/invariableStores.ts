import { createEditorStore } from 'components/editor/Store/create';
import { createSelectableTableStore } from 'components/tables/Store';
import { createFormStateStore } from 'stores/FormState/Store';
import {
    AdminStoreNames,
    EditorStoreNames,
    FormStateStoreNames,
    ResourceConfigStoreNames,
    SelectTableStoreNames,
    ShardDetailStoreNames,
} from 'stores/names';
import { createResourceConfigStore } from 'stores/ResourceConfig/Store';
import { createShardDetailStore } from 'stores/ShardDetail/Store';
import { createStorageMappingsStore } from 'stores/StorageMappings/Store';
import { MessagePrefixes } from 'types';

const invariableStores = {
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

    // Editor Store
    [EditorStoreNames.CAPTURE]: createEditorStore(EditorStoreNames.CAPTURE),
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
    [SelectTableStoreNames.ACCESS_GRANTS]: createSelectableTableStore(
        SelectTableStoreNames.ACCESS_GRANTS
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

    // Admin Storage Mappings
    [AdminStoreNames.STORAGE_MAPPINGS]: createStorageMappingsStore(
        AdminStoreNames.STORAGE_MAPPINGS
    ),
};

export default invariableStores;
