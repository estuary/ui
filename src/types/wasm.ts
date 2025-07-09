import type {
    Projection,
    ValidationResponse_Binding,
} from 'src/components/editor/Bindings/FieldSelection/types';

// evaluate_field selection WASM routine documentation can be found here:
// https://github.com/estuary/flow/blob/master/crates/flow-web/FIELD_SELECTION.md

enum RejectReason {
    USER_EXCLUDES = 'UserExcludes',
    CONNECTOR_FORBIDS = 'ConnectorForbids',
    CONNECTOR_UNSATISFIABLE = 'ConnectorUnsatisfiable',
    COLLECTION_OMITS = 'CollectionOmits',
    CONNECTOR_OMITS = 'ConnectorOmits',
    DUPLICATE_FOLD = 'DuplicateFold',
    DUPLICATE_LOCATION = 'DuplicateLocation',
    COVERED_LOCATION = 'CoveredLocation',
    NOT_SELECTED = 'NotSelected',
}

enum SelectReason {
    GROUP_BY_KEY = 'GroupByKey',
    CURRENT_DOCUMENT = 'CurrentDocument',
    USER_REQUIRES = 'UserRequires',
    CONNECTOR_REQUIRES = 'ConnectorRequires',
    PARTITION_KEY = 'PartitionKey',
    CURRENT_VALUE = 'CurrentValue',
    USER_DEFINED = 'UserDefined',
    CONNECTOR_REQUIRES_LOCATION = 'ConnectorRequiresLocation',
    CORE_METADATA = 'CoreMetadata',
    DESIRED_DEPTH = 'DesiredDepth',
}

interface FieldOutcome {
    field: string;
    isUnsatisfiable?: boolean;
    reject?: RejectOutput;
    select?: SelectOutput;
}

interface FieldSelection {
    document: string;
    fieldConfig: Record<string, string>;
    keys: string[];
    values: string[];
}

export interface FieldSelectionInput {
    collectionKey: string[];
    collectionProjections: Projection[];
    model: MaterializationBinding;
    validated: ValidationResponse_Binding;
    liveSpec?: MaterializationBinding;
}

export interface FieldSelectionResult {
    hasConflicts: boolean;
    outcomes: FieldOutcome[];
    selection: FieldSelection;
}

export interface MaterializationBinding {
    [key: string]: any;
}

interface RejectOutput {
    detail: string;
    reason: RejectReason;
}

interface SelectOutput {
    detail: string;
    reason: SelectReason;
}
