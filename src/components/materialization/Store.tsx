import { JsonFormsCore } from '@jsonforms/core';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface CreationConfig extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        [key: string]: any;
    };
}

// interface Collections {
//     source: string;
//     resource: any; // MaterializationBinding['resource'];
// }

export enum CreationFormStatuses {
    IDLE = 'Idle',
    GENERATING_PREVIEW = 'Generating Preview',
    TESTING = 'Testing',
    SAVING = 'Saving',
}

export interface CreationState {
    // Resource Config
    resourceConfig: {
        [key: string]: CreationConfig;
    };
    setResourceConfig: (key: string, value?: CreationConfig) => void;

    // Collection Selector
    collections: any[];
    setCollections: (collections: any[]) => void;
    prefillCollections: (collections: any[]) => void;
}

const getInitialStateData = (): Pick<
    CreationState,
    'resourceConfig' | 'collections'
> => {
    return {
        resourceConfig: {},
        collections: [],
    };
};

const getDefaultResourceConfig = () => ({
    data: {},
    errors: {},
});

const useCreationStore = create<CreationState>()(
    devtools(
        (set) => ({
            ...getInitialStateData(),
            setResourceConfig: (key, value) => {
                set(
                    produce((state) => {
                        state.resourceConfig[key] =
                            value ?? getDefaultResourceConfig();
                    }),
                    false,
                    'Resource Config Changed'
                );
            },

            setCollections: (value) => {
                set(
                    produce((state) => {
                        state.collections = value;
                    }),
                    false,
                    'Collections Changed'
                );
            },

            prefillCollections: (value) => {
                set(
                    produce((state) => {
                        state.collections = value;
                        state.resourceConfig = {};
                        value.forEach((collection) => {
                            state.resourceConfig[collection] =
                                getDefaultResourceConfig();
                        });
                    }),
                    false,
                    'Collections Prefilled'
                );
            },
        }),
        devtoolsOptions('materialization-creation-state')
    )
);

export default useCreationStore;

export const creationSelectors = {
    collections: (state: CreationState) => state.collections,
    setCollection: (state: CreationState) => state.setCollections,
    prefillCollections: (state: CreationState) => state.prefillCollections,
    resourceConfig: (state: CreationState) => state.resourceConfig,
    setResourceConfig: (state: CreationState) => state.setResourceConfig,
};
