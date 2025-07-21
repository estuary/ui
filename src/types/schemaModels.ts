import type { FullSource } from 'src/stores/Binding/slices/TimeTravel';
import type { Schema } from 'src/types';

export interface MaterializationBinding {
    resource: any;
    source: string | FullSource;
    backfill?: number;
    disable?: boolean;
    fields?: MaterializationFields | MaterializationFields_Legacy;
    onIncompatibleSchemaChange?: string;
    priority?: number;
}

export interface MaterializationFields {
    recommended: boolean | number;
    exclude?: string[];
    groupBy?: string[];
    require?: Schema;
}

export interface MaterializationFields_Legacy {
    recommended: boolean | number;
    exclude?: string[];
    groupBy?: string[];
    include?: Schema;
}

export interface ProjectionDef {
    location: string;
    partition?: boolean;
}

export interface Projections {
    [field: string]: string | ProjectionDef;
}
