import type { WorkflowState } from 'src/stores/Workflow/types';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

interface ProjectionDef {
    location: string;
    partition?: boolean;
}

interface Projections {
    [field: string]: string | ProjectionDef;
}

interface ProjectionDictionary {
    [collection: string]: Projections;
}

export interface StoreWithProjections {
    projections: ProjectionDictionary;
    setSingleProjection: (
        projection: ProjectionDef,
        field: string,
        collection: string
    ) => void;
}

export const getInitialProjectionData = (): Pick<
    StoreWithProjections,
    'projections'
> => ({
    projections: {},
});

export const getStoreWithProjectionSettings = (
    set: NamedSet<StoreWithProjections>
): StoreWithProjections => ({
    ...getInitialProjectionData(),

    setSingleProjection: (projection, field, collection) => {
        set(
            produce((state: WorkflowState) => {
                state.projections[collection] = {
                    ...state.projections[collection],
                    [field]: projection,
                };
            }),
            false,
            'Single Projection Set'
        );
    },
});
