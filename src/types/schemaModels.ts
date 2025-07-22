import type { FullSource } from 'src/stores/Binding/slices/TimeTravel';
import type { Schema } from 'src/types';

export interface BaseMaterializationFields {
    recommended: boolean | number;
    exclude?: string[];
    groupBy?: string[];
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
