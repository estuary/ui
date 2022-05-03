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

export enum CreationFormStatuses {
    IDLE = 'Idle',
    GENERATING_PREVIEW = 'Generating Preview',
    TESTING = 'Testing',
    SAVING = 'Saving',
}

export interface CreationState {
    // Resource Config
    resourceConfig: CreationConfig;
    setResourceConfig: (value: CreationConfig) => void;

    // Collection Selector
    collections: string[];
    setCollections: (collections: string[]) => void;
}

const getInitialStateData = (): Pick<
    CreationState,
    'resourceConfig' | 'collections'
> => {
    return {
        resourceConfig: {
            data: {},
            errors: [],
        },
        collections: [],
    };
};

const useCreationStore = create<CreationState>()(
    devtools(
        (set) => ({
            ...getInitialStateData(),
            setResourceConfig: (value) => {
                set(
                    produce((state) => {
                        state.resourceConfig = value;
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
        }),
        devtoolsOptions('materialization-creation-state')
    )
);

export default useCreationStore;
