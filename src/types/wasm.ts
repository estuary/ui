import type {
    BuiltProjection,
    MaterializationBinding,
    MaterializationBuiltBinding,
    ValidatedBinding,
} from 'src/types/schemaModels';

// evaluate_field selection WASM routine documentation can be found here:
// https://github.com/estuary/flow/blob/master/crates/flow-web/FIELD_SELECTION.md

export enum RejectReason {
    USER_EXCLUDES = 'UserExcludes',
    CONNECTOR_FORBIDS = 'ConnectorForbids',
    CONNECTOR_INCOMPATIBLE = 'ConnectorIncompatible',
    COLLECTION_OMITS = 'CollectionOmits',
    CONNECTOR_OMITS = 'ConnectorOmits',
    DUPLICATE_FOLD = 'DuplicateFold',
    DUPLICATE_LOCATION = 'DuplicateLocation',
    COVERED_LOCATION = 'CoveredLocation',
    EXCLUDED_PARENT = 'ExcludedParent',
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
    isIncompatible?: boolean;
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
    collectionProjections: BuiltProjection[];
    model: MaterializationBinding;
    validated: ValidatedBinding;
    liveSpec?: MaterializationBuiltBinding;
}

export interface FieldSelectionInput_Skim {
    collection: {
        name: string;
        model: any; //Collection Spec (drafted or live) ?
    };
    binding: {
        live: any; //MaterializationBuiltBinding ?
        model: any; // MaterializationBinding?
        validated: any; //ValidatedBinding?
    };
}

export interface FieldSelectionResult {
    hasConflicts: boolean;
    outcomes: FieldOutcome[];
    selection: FieldSelection;
}

export interface RejectOutput {
    detail: string;
    reason: RejectOutputReason;
}

interface RejectOutputReason {
    type: RejectReason;
    [key: string]: any;
}

export interface SelectOutput {
    detail: string;
    reason: SelectOutputReason;
}

interface SelectOutputReason {
    type: SelectReason;
    [key: string]: any;
}

// Skim Projections
export interface BasicSchemaModel {
    schema: any;
}

export interface SplitSchemaModel {
    writeSchema: any;
    readSchema: any;
}

export interface CollectionDef {
    key: any;
    projections: any;
    journals: any;
    derive: any;
    expectPubId: any;
    delete: any;
    reset: any;
}

export interface BasicCollectionDef extends CollectionDef, BasicSchemaModel {}
export interface SplitCollectionDef extends CollectionDef, SplitSchemaModel {}

export interface SkimProjectionResponse {
    errors: any[];
    projections: BuiltProjection[];
}
