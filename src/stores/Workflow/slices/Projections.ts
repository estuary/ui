import type { WorkflowState } from 'src/stores/Workflow/types';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

interface ProjectionMetadata {
    field: string;
    location: string;
    partition?: boolean;
}

interface FlatProjections {
    [location: string]: ProjectionMetadata;
}

interface ProjectionDictionary {
    [collection: string]: FlatProjections;
}

export interface StoreWithProjections {
    projections: ProjectionDictionary;
    setSingleProjection: (
        metadata: ProjectionMetadata,
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

    setSingleProjection: (metadata, collection) => {
        set(
            produce((state: WorkflowState) => {
                state.projections[collection] = {
                    ...state.projections[collection],
                    [metadata.location]: metadata,
                };
            }),
            false,
            'Single Projection Set'
        );
    },
});
