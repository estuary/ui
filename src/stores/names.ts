export enum BindingsEditorStoreNames {
    GENERAL = 'general_bindings_editor',
}

export enum DetailsFormStoreNames {
    CAPTURE = 'capture-details-form',
    MATERIALIZATION = 'materialization-details-form',
}

export enum EditorStoreNames {
    CAPTURE = 'capture_editor_store',
    GENERAL = 'general_editor_store',
    MATERIALIZATION = 'materialization_editor_store',
}

export enum EndpointConfigStoreNames {
    GENERAL = 'general-endpoint-config',
}

export enum ExistingEntityStoreNames {
    GENERAL = 'general-existing-entity',
}

export enum FormStateStoreNames {
    CAPTURE_CREATE = 'Capture-Create-Form-State',
    CAPTURE_EDIT = 'Capture-Edit-Form-State',
    MATERIALIZATION_CREATE = 'Materialization-Create-Form-State',
    MATERIALIZATION_EDIT = 'Materialization-Edit-Form-State',
}

export enum ResourceConfigStoreNames {
    GENERAL = 'general-resource-config',
}

export enum SelectTableStoreNames {
    ACCESS_GRANTS_USERS = 'AccessGrants-Selectable-Table-Users',
    ACCESS_GRANTS_PREFIXES = 'AccessGrants-Selectable-Table-Prefixes',
    BILLING = 'Billing-Selectable-Table',
    CAPTURE = 'Captures-Selectable-Table',
    COLLECTION = 'Collections-Selectable-Table',
    CONNECTOR = 'Connectors-Selectable-Table',
    MATERIALIZATION = 'Materializations-Selectable-Table',
    STORAGE_MAPPINGS = 'Storage-Mappings-Selectable-Table',
}

export enum ShardDetailStoreNames {
    CAPTURE = 'Capture-Shard-Detail',
    MATERIALIZATION = 'Materialization-Shard-Detail',
    COLLECTION = 'Collection-Shard-Detail',
}

export enum AdminStoreNames {
    STORAGE_MAPPINGS = 'Storage-Mappings',
}

export enum GlobalStoreNames {
    SIDE_PANEL_DOCS = 'Side-Panel-Docs',
}

export enum TransformCreateStoreNames {
    TRANSFORM_CREATE = 'Transform-Create',
}

export type StoreName =
    | BindingsEditorStoreNames
    | DetailsFormStoreNames
    | EditorStoreNames
    | EndpointConfigStoreNames
    | ExistingEntityStoreNames
    | FormStateStoreNames
    | ResourceConfigStoreNames
    | SelectTableStoreNames
    | ShardDetailStoreNames
    | AdminStoreNames
    | TransformCreateStoreNames
    | GlobalStoreNames;
