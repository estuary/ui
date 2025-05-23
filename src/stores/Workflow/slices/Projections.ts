import type { ProjectionDef, Projections } from 'src/types/schemaModels';
import type { NamedSet } from 'zustand/middleware';

import produce from 'immer';

export interface ProjectionMetadata extends ProjectionDef {
    field: string;
    systemDefined?: boolean;
}

interface FlatProjections {
    [location: string]: ProjectionMetadata[];
}

interface ProjectionDictionary {
    [collection: string]: FlatProjections;
}

export interface StoreWithProjections {
    initializeProjections: (
        existingProjections: Projections | undefined,
        collection: string
    ) => void;
    projections: ProjectionDictionary;
    removeSingleProjection: (
        metadata: ProjectionMetadata,
        collection: string
    ) => void;
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

    initializeProjections: (existingProjections, collection) => {
        if (!existingProjections) {
            return;
        }

        set(
            produce((state: StoreWithProjections) => {
                Object.entries(existingProjections)
                    .map(
                        ([field, value]): ProjectionMetadata =>
                            typeof value === 'string'
                                ? { field, location: value }
                                : { field, ...value }
                    )
                    .forEach((metadata) => {
                        const cumulativeProjections =
                            state.projections[collection]?.[
                                metadata.location
                            ] ?? [];

                        const storedProjectionIndex =
                            cumulativeProjections.findIndex(
                                ({ field }) => field === metadata.field
                            );

                        if (storedProjectionIndex === -1) {
                            state.projections[collection] = {
                                ...state.projections[collection],
                                [metadata.location]:
                                    cumulativeProjections.concat(metadata),
                            };
                        } else {
                            state.projections[collection][metadata.location][
                                storedProjectionIndex
                            ] = metadata;
                        }
                    });
            }),
            false,
            'Projections Initialized'
        );
    },

    removeSingleProjection: (metadata, collection) => {
        set(
            produce((state: StoreWithProjections) => {
                const existingProjections =
                    state.projections[collection]?.[metadata.location] ?? [];

                state.projections[collection] = {
                    ...state.projections[collection],
                    [metadata.location]: existingProjections.filter(
                        ({ field }) => field !== metadata.field
                    ),
                };
            }),
            false,
            'Single Projection Removed'
        );
    },

    setSingleProjection: (metadata, collection) => {
        set(
            produce((state: StoreWithProjections) => {
                const existingProjections =
                    state.projections[collection]?.[metadata.location] ?? [];

                state.projections[collection] = {
                    ...state.projections[collection],
                    [metadata.location]: existingProjections.concat(metadata),
                };
            }),
            false,
            'Single Projection Set'
        );
    },
});
