import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/postgrest-js';
import produce from 'immer';
import { isEqual } from 'lodash';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

interface CreationDetails extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        name: string;
        image: string;
    };
}

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

interface CreationFormState {
    showValidation: boolean;
    status: CreationFormStatuses;
    showLogs: boolean;
    saveStatus: string;
    exitWhenLogsClose: boolean;
    logToken: string | null;
    error: {
        title: string;
        error?: PostgrestError;
    } | null;
}

export interface CreationState {
    // Details
    details: CreationDetails;
    setDetails: (details: CreationDetails) => void;

    // Endpoint Config
    endpointConfig: CreationConfig;
    setEndpointConfig: (value: CreationConfig) => void;

    // Resource Config
    resourceConfig: CreationConfig;
    setResourceConfig: (value: CreationConfig) => void;

    formState: CreationFormState;
    setFormState: (data: Partial<CreationFormState>) => void;
    resetFormState: (status: CreationFormStatuses) => void;

    // Collection Selector
    collections: string[];
    setCollections: (collections: string[]) => void;

    // Misc.
    connectors: { [key: string]: any }[];
    setConnectors: (val: { [key: string]: any }[]) => void;
    resetState: () => void;
    hasChanges: () => boolean;
}

const getInitialStateData = (): Pick<
    CreationState,
    | 'details'
    | 'endpointConfig'
    | 'resourceConfig'
    | 'connectors'
    | 'collections'
    | 'formState'
> => {
    return {
        details: {
            data: { image: '', name: '' },
            errors: [],
        },
        endpointConfig: {
            data: {},
            errors: [],
        },
        resourceConfig: {
            data: {},
            errors: [],
        },
        connectors: [],
        collections: [],
        formState: {
            showValidation: false,
            status: CreationFormStatuses.IDLE,
            showLogs: false,
            exitWhenLogsClose: false,
            logToken: null,
            saveStatus: 'running...',
            error: null,
        },
    };
};

const useMaterializationCreationStore = create<CreationState>()(
    devtools(
        (set, get) => ({
            ...getInitialStateData(),
            setDetails: (value) => {
                set(
                    produce((state) => {
                        if (
                            value.data.image.length > 0 &&
                            state.details.data.image !== value.data.image
                        ) {
                            const initState = getInitialStateData();

                            state.spec = initState.endpointConfig;
                            state.formState = initState.formState;
                        }

                        state.details = value;
                    }),
                    false,
                    'Details Changed'
                );
            },

            setEndpointConfig: (value) => {
                set(
                    produce((state) => {
                        state.endpointConfig = value;
                    }),
                    false,
                    'Endpoint Config Changed'
                );
            },

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

            setFormState: (value) => {
                set(
                    produce((state) => {
                        const { formState } = get();

                        state.formState = {
                            ...formState,
                            ...value,
                        };
                    }),
                    false,
                    'Form State Changed'
                );
            },

            resetFormState: (value) => {
                set(
                    produce((state) => {
                        const { formState } = getInitialStateData();

                        state.formState = formState;
                        state.formState.status = value;
                    }),
                    false,
                    'Form State Reset'
                );
            },

            hasChanges: () => {
                const { details, endpointConfig, resourceConfig } = get();

                const {
                    details: initialDetails,
                    endpointConfig: initialEndpointConfig,
                    resourceConfig: initialResourceConfig,
                } = getInitialStateData();

                return !isEqual(
                    {
                        details: details.data,
                        endpointConfig: endpointConfig.data,
                        resourceConfig: resourceConfig.data,
                    },
                    {
                        details: initialDetails.data,
                        endpointConfig: initialEndpointConfig.data,
                        resourceConfig: initialResourceConfig.data,
                    }
                );
            },

            setConnectors: (value) => {
                set(
                    produce((state) => {
                        state.connectors = value;
                    }),
                    false,
                    'Connector Response Cached'
                );
            },

            resetState: () => {
                set(getInitialStateData(), false, 'State Reset');
            },
        }),
        devtoolsOptions('materialization-creation-state')
    )
);

export default useMaterializationCreationStore;
