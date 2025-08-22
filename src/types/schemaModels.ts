import type { FullSource } from 'src/stores/Binding/slices/TimeTravel';
import type { Schema } from 'src/types';

// The constraint types are ordered by severity, with one being the most severe and six the least.
enum ConstraintTypes {
    INCOMPATIBLE = 1,
    FIELD_FORBIDDEN = 2,
    FIELD_OPTIONAL = 3,
    LOCATION_RECOMMENDED = 4,
    LOCATION_REQUIRED = 5,
    FIELD_REQUIRED = 6,
}

type ConstraintType = keyof typeof ConstraintTypes;

export interface BaseMaterializationFields {
    recommended: boolean | number;
    exclude?: string[];
    groupBy?: string[];
}

// The definition of a binding in the built specification.
export interface BuiltBinding {
    collection: BuiltCollection;
    fieldSelection: FieldSelection;
    journalReadSuffix: string;
    partitionSelector: any;
    resourceConfig: any;
    resourcePath: string[];
}

interface BuiltCollection {
    ackTemplate: any;
    key: string[];
    name: string;
    partitionTemplate: any;
    projections: BuiltProjection[];
    uuidPtr: string;
    writeSchema: Schema;
}

export interface BuiltProjection {
    field: string;
    inference: any;
    ptr?: string;
    isPrimaryKey?: boolean;
}

interface Constraint {
    type: ConstraintType;
    reason: string;
}

interface ConstraintDictionary {
    [key: string]: Constraint;
}

interface FieldSelection {
    keys: string[];
    values: string[];
    document: string;
    fieldConfig?: { [field: string]: any };
}

export interface MaterializationBinding {
    resource: any;
    source: string | FullSource;
    backfill?: number;
    disable?: boolean;
    fields?: MaterializationFields | MaterializationFields_Legacy;
    onIncompatibleSchemaChange?: string;
    priority?: number;
}

export interface MaterializationFields extends BaseMaterializationFields {
    require?: Schema;
}

export interface MaterializationFields_Legacy
    extends BaseMaterializationFields {
    include?: Schema;
}

export interface ProjectionDef {
    location: string;
    partition?: boolean;
}

export interface Projections {
    [field: string]: string | ProjectionDef;
}

// The definition of a binding in the validation response.
export interface ValidatedBinding {
    constraints: ConstraintDictionary;
    resourcePath: string[];
}
