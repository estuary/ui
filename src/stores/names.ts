export enum BillingStoreNames {
    GENERAL = 'general_billing',
}

export enum BindingsEditorStoreNames {
    GENERAL = 'general_bindings_editor',
}

export enum DetailsFormStoreNames {
    CAPTURE = 'capture-details-form',
    COLLECTION = 'collection-details-form',
    MATERIALIZATION = 'materialization-details-form',
}

export enum EditorStoreNames {
    BINDINGS = 'bindings_editor_store',
    CAPTURE = 'capture_editor_store',
    DERIVATION = 'derivation_editor_store',
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
    COLLECTION_CREATE = 'Collection-Create-Form-State',
    MATERIALIZATION_CREATE = 'Materialization-Create-Form-State',
    MATERIALIZATION_EDIT = 'Materialization-Edit-Form-State',
}

export enum OnboardingStoreNames {
    GENERAL = 'Onboarding',
}

export enum ResourceConfigStoreNames {
    GENERAL = 'general-resource-config',
}

export enum SelectTableStoreNames {
    ACCESS_GRANTS_LINKS = 'AccessGrants-Links',
    ACCESS_GRANTS_USERS = 'AccessGrants-Users',
    ACCESS_GRANTS_PREFIXES = 'AccessGrants-Prefixes',
    BILLING = 'Billing-Table',
    CAPTURE = 'Captures-Table',
    COLLECTION = 'Collections-Table',
    COLLECTION_SELECTOR = 'CollectionsSelectorTable',
    CONNECTOR = 'Connectors-Table',
    MATERIALIZATION = 'Materializations-Table',
    STORAGE_MAPPINGS = 'Storage-Mappings-Table',
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
    ENTITIES = 'Entities',
    SIDE_PANEL_DOCS = 'Side-Panel-Docs',
    TOP_BAR = 'Top-Bar',
}

export enum TransformCreateStoreNames {
    TRANSFORM_CREATE = 'Transform-Create',
}

export type StoreName =
    | BillingStoreNames
    | BindingsEditorStoreNames
    | DetailsFormStoreNames
    | EditorStoreNames
    | EndpointConfigStoreNames
    | ExistingEntityStoreNames
    | FormStateStoreNames
    | OnboardingStoreNames
    | ResourceConfigStoreNames
    | SelectTableStoreNames
    | ShardDetailStoreNames
    | AdminStoreNames
    | TransformCreateStoreNames
    | GlobalStoreNames;
