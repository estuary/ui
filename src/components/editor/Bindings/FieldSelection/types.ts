import type { Schema } from 'src/types';

export interface Projection {
    field: string;
    inference: any;
    ptr?: string;
    isPrimaryKey?: boolean;
}

interface Collection {
    ackTemplate: any;
    key: string[];
    name: string;
    partitionTemplate: any;
    projections: Projection[];
    uuidPtr: string;
    writeSchema: Schema;
}

export interface FieldSelection {
    keys: string[];
    values: string[];
    document: string;
    fieldConfig?: { [field: string]: any };
}

export interface BuiltSpec_Binding {
    collection: Collection;
    fieldSelection: FieldSelection;
    journalReadSuffix: string;
    partitionSelector: any;
    resourceConfig: any;
    resourcePath: string[];
}

// The constraint types are ordered by severity, with one being the most severe and six the least.
export enum ConstraintTypes {
    UNSATISFIABLE = 1,
    FIELD_FORBIDDEN = 2,
    FIELD_OPTIONAL = 3,
    LOCATION_RECOMMENDED = 4,
    LOCATION_REQUIRED = 5,
    FIELD_REQUIRED = 6,
}

export type ConstraintType = keyof typeof ConstraintTypes;

export interface Constraint {
    type: ConstraintType;
    reason: string;
}

export interface ConstraintDictionary {
    [key: string]: Constraint;
}

export interface ValidationResponse_Binding {
    constraints: ConstraintDictionary;
    resourcePath: string[];
}

export type FieldSelectionType = 'default' | 'require' | 'exclude';

export interface TranslatedConstraint {
    type: ConstraintTypes;
    reason: string;
}

export interface CompositeProjection extends Projection {
    constraint: TranslatedConstraint | null;
    selectionType: FieldSelectionType | null;
    selectionMetadata?: Schema;
}
