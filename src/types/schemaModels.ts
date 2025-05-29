export interface ProjectionDef {
    location: string;
    partition?: boolean;
}

export interface Projections {
    [field: string]: string | ProjectionDef;
}
