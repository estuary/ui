import { Schema } from 'types';

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

export interface BuiltSpec_Binding {
    collection: Collection;
    fieldSelection: any;
    journalReadSuffix: string;
    partitionSelector: any;
    resourceConfig: any;
    resourcePath: string[];
}

export type ConstraintType =
    | 'FIELD_REQUIRED'
    | 'LOCATION_REQUIRED'
    | 'LOCATION_RECOMMENDED'
    | 'FIELD_OPTIONAL'
    | 'FIELD_FORBIDDEN'
    | 'UNSATISFIABLE';

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

export interface CompositeProjection extends Projection {
    constraint: Constraint | null;
}
