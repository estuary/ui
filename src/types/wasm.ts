import type {
    BuiltSpec_Binding,
    Projection,
    ValidationResponse_Binding,
} from 'src/components/fieldSelection/types';
import type { MaterializationBinding } from 'src/types/schemaModels';

// evaluate_field selection WASM routine documentation can be found here:
// https://github.com/estuary/flow/blob/master/crates/flow-web/FIELD_SELECTION.md

export enum RejectReason {
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

export enum SelectReason {
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

export interface FieldOutcome {
    field: string;
    isUnsatisfiable?: boolean;
    reject?: RejectOutput;
    select?: SelectOutput;
}

// TODO (typing): Determine whether the FieldSelection interface related to the WASM function
//   differs from that of the built binding. Presently, there is a type conflict between the
//   two which is highlighted by the semi-duplicate interface defined in
//   src/components/fieldSelection/types.ts.
interface FieldSelection {
    document: string;
    fieldConfig: Record<string, string>;
    keys: string[];
    values?: string[];
}

// The corresponding built spec binding is intended to be passed to the liveSpec property.
// Do NOT use the corresponding live spec binding.
export interface FieldSelectionInput {
    collectionKey: string[];
    collectionProjections: Projection[];
    model: MaterializationBinding;
    validated: ValidationResponse_Binding;
    liveSpec?: BuiltSpec_Binding;
}

export interface FieldSelectionResult {
    hasConflicts: boolean;
    outcomes: FieldOutcome[];
    selection: FieldSelection;
}

export interface RejectOutput {
    detail: string;
    reason: RejectReason;
}

export interface SelectOutput {
    detail: string;
    reason: SelectReason;
}
