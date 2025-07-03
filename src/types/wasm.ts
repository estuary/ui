import type { ValidationResponse_Binding } from 'src/components/editor/Bindings/FieldSelection/types';
import type { ProjectionDef } from 'src/types/schemaModels';

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
    field: string; // Field name
    select?: SelectOutput; // Structured selection reason (if selected)
    reject?: RejectOutput; // Structured rejection reason (if rejected)
    isUnsatisfiable?: boolean; // True when conflict has ConnectorUnsatisfiable reject reason
}

interface FieldSelection {
    keys: string[]; // Fields used as primary key
    values: string[]; // Fields materialized as values
    document: string; // Field storing full document (if any)
    fieldConfigJsonMap: Record<string, string>; // Per-field connector configuration
}

export interface FieldSelectionInput {
    collectionKey: string[]; // Collection key JSON pointers (e.g., ["/id", "/timestamp"])
    collectionProjections: ProjectionDef[]; // Available fields from the collection
    model: MaterializationBinding; // User's desired configuration
    validated: ValidationResponse_Binding;
    liveSpec?: MaterializationBinding; // Existing materialization (if updating)
}

export interface FieldSelectionResult {
    outcomes: FieldOutcome[]; // Per-field selection details
    selection: FieldSelection; // Final materialization configuration
    hasConflicts: boolean;
}

interface MaterializationBinding {
    [key: string]: any;
}

interface RejectOutput {
    reason: RejectReason; // Structured rejection reason
    detail: string; // Human-readable description
}

interface SelectOutput {
    reason: SelectReason; // Structured selection reason
    detail: string; // Human-readable description
}
