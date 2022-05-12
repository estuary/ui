import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/postgrest-js';
import produce from 'immer';
import { isEqual } from 'lodash';
import { GetState } from 'zustand';
import { NamedSet } from 'zustand/middleware';

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        description?: string;
        entityName: string;
        connectorImage?: {
            id: string;
            iconPath: string;
        };
    };
}

export interface EndpointConfig extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        [key: string]: any;
    };
}

export interface FormState {
    displayValidation: boolean;
    status: FormStatus;
    showLogs: boolean;
    saveStatus: string;
    exitWhenLogsClose: boolean;
    logToken: string | null;
    error: {
        title: string;
        error?: PostgrestError;
    } | null;
}

export enum FormStatus {
    SAVING = 'saving',
    TESTING = 'testing',
    IDLE = 'idle',
    GENERATING_PREVIEW = 'Generating Preview',
}

export interface CreateEntityStore {
    //Details
    details: Details;
    setDetails: (details: Details) => void;

    //Spec
    endpointConfig: EndpointConfig;
    setEndpointConfig: (endpointConfig: EndpointConfig) => void;

    formState: FormState;
    setFormState: (data: Partial<FormState>) => void;
    resetFormState: (status: FormStatus) => void;

    //Misc
    connectors: { [key: string]: any }[];
    setConnectors: (val: CreateEntityStore['connectors']) => void;
    endpointSchema: { [key: string]: any };
    setEndpointSchema: (val: CreateEntityStore['endpointSchema']) => void;

    resetState: () => void;
    hasChanges: () => boolean;
}

export const initialCreateStates = {
    connectors: () => {
        return [];
    },
    details: (): Details => {
        return {
            data: {
                connectorImage: {
                    id: '',
                    iconPath: '',
                },
                entityName: '',
            },
            errors: [],
        };
    },
    endpointSchema: () => {
        return {};
    },
    endpointConfig: (): EndpointConfig => {
        return {
            data: {},
            errors: [],
        };
    },
    formState: (): FormState => {
        return {
            displayValidation: false,
            status: FormStatus.IDLE,
            showLogs: false,
            exitWhenLogsClose: false,
            logToken: null,
            saveStatus: 'running...',
            error: null,
        };
    },
};

export const getInitialStateData = (): Pick<
    CreateEntityStore,
    'details' | 'endpointConfig' | 'connectors' | 'formState' | 'endpointSchema'
> => {
    return {
        details: initialCreateStates.details(),
        endpointConfig: initialCreateStates.endpointConfig(),
        connectors: initialCreateStates.connectors(),
        formState: initialCreateStates.formState(),
        endpointSchema: initialCreateStates.endpointSchema(),
    };
};

export const getInitialState = (
    set: NamedSet<CreateEntityStore>,
    get: GetState<CreateEntityStore>
): CreateEntityStore => {
    return {
        ...getInitialStateData(),
        setDetails: (details) => {
            set(
                produce((state) => {
                    if (
                        state.details.data.connectorImage?.id !==
                        details.data.connectorImage?.id
                    ) {
                        const initState = getInitialStateData();
                        state.endpointConfig = initState.endpointConfig;
                        state.formState = initState.formState;
                    }

                    state.details = details;
                }),
                false,
                'Details changed'
            );
        },

        setEndpointConfig: (endpointConfig) => {
            set(
                produce((state) => {
                    state.endpointConfig = endpointConfig;
                }),
                false,
                'Endpoint config changed'
            );
        },

        setFormState: (newState) => {
            set(
                produce((state) => {
                    const { formState } = get();
                    state.formState = {
                        ...formState,
                        ...newState,
                    };
                }),
                false,
                'Form State changed'
            );
        },

        resetFormState: (status) => {
            set(
                produce((state) => {
                    const { formState } = getInitialStateData();
                    state.formState = formState;
                    state.formState.status = status;
                }),
                false,
                'Form State Reset'
            );
        },

        hasChanges: () => {
            const { details, endpointConfig } = get();
            const {
                details: initialDetails,
                endpointConfig: initialendpointConfig,
            } = getInitialStateData();

            return !isEqual(
                {
                    details: details.data,
                    endpointConfig: endpointConfig.data,
                },
                {
                    details: initialDetails.data,
                    endpointConfig: initialendpointConfig.data,
                }
            );
        },
        setConnectors: (val) => {
            set(
                produce((state) => {
                    state.connectors = val;
                }),
                false,
                'Caching connectors response'
            );
        },
        setEndpointSchema: (val) => {
            set(
                produce((state) => {
                    state.endpointSchema = val;
                }),
                false,
                'Setting endpointSchema'
            );
        },
        resetState: () => {
            set(getInitialStateData(), false, 'Resetting State');
        },
    };
};

export const createStoreSelectors = {
    details: {
        data: (state: CreateEntityStore) => state.details.data,
        entityName: (state: CreateEntityStore) => state.details.data.entityName,
        connectorTag: (state: CreateEntityStore) =>
            state.details.data.connectorImage,
        description: (state: CreateEntityStore) =>
            state.details.data.description,
        set: (state: CreateEntityStore) => state.setDetails,
    },
    endpointConfig: {
        id: (state: CreateEntityStore) => state.endpointConfig.data.id,
        data: (state: CreateEntityStore) => state.endpointConfig.data,
        set: (state: CreateEntityStore) => state.setEndpointConfig,
    },
    formState: {
        formStateSaveStatus: (state: CreateEntityStore) =>
            state.formState.saveStatus,
        formStateStatus: (state: CreateEntityStore) => state.formState.status,
        showLogs: (state: CreateEntityStore) => state.formState.showLogs,
        logToken: (state: CreateEntityStore) => state.formState.logToken,
        error: (state: CreateEntityStore) => state.formState.error,
        exitWhenLogsClose: (state: CreateEntityStore) =>
            state.formState.exitWhenLogsClose,
        displayValidation: (state: CreateEntityStore) =>
            state.formState.displayValidation,
        status: (state: CreateEntityStore) => state.formState.status,
        set: (state: CreateEntityStore) => state.setFormState,
        reset: (state: CreateEntityStore) => state.resetFormState,
    },
    connectors: (state: CreateEntityStore) => state.connectors,
    endpointSchema: (state: CreateEntityStore) => state.endpointSchema,
    setEndpointSchema: (state: CreateEntityStore) => state.setEndpointSchema,

    resetState: (state: CreateEntityStore) => state.resetState,
    hasChanges: (state: CreateEntityStore) => state.hasChanges,
    errors: (state: CreateEntityStore) => [
        state.details.errors,
        state.endpointConfig.errors,
    ],
};
