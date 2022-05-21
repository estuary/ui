import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/postgrest-js';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { isEqual, map } from 'lodash';
import { Stores } from 'stores/Repo';
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

export interface JsonFormsData extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        [key: string]: any;
    };
}

export interface ResourceConfig {
    errors: any[];
    [key: string]: JsonFormsData | any[];
}

export interface FormState {
    displayValidation: boolean;
    status: FormStatus;
    showLogs: boolean;
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
    SUCCESS = 'success',
    FAILED = 'failed',
    GENERATING_PREVIEW = 'Generating Preview',
}

export const formInProgress = (formStateStatus: FormStatus) => {
    return (
        formStateStatus === FormStatus.TESTING ||
        formStateStatus === FormStatus.GENERATING_PREVIEW ||
        formStateStatus === FormStatus.SAVING
    );
};

const getDefaultJsonFormsData = () => ({
    data: {},
    errors: [],
});

export interface CreateEntityStore {
    //Details
    details: Details;
    setDetails: (details: Details) => void;

    //Spec
    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;

    // Resource Config
    resourceConfig: { [key: string]: ResourceConfig };
    setResourceConfig: (key: string, value?: ResourceConfig) => void;
    getResourceConfigErrors: () => any[];

    // Collection Selector
    collections: any[] | null;
    setCollections: (collections: any[]) => void;
    prefillCollections: (collections: LiveSpecsExtQuery[]) => void;

    //Form State
    formState: FormState;
    setFormState: (data: Partial<FormState>) => void;
    resetFormState: (status: FormStatus) => void;

    //Misc
    connectors: { [key: string]: any }[];
    setConnectors: (val: CreateEntityStore['connectors']) => void;
    endpointSchema: { [key: string]: any };
    setEndpointSchema: (val: CreateEntityStore['endpointSchema']) => void;

    //Content
    messagePrefix: Stores;

    resetState: () => void;
    hasChanges: () => boolean;
}

export const initialCreateStates = {
    collections: () => {
        return [];
    },
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
    endpointConfig: (): JsonFormsData => {
        const defaults = getDefaultJsonFormsData();
        return { ...defaults };
    },
    formState: (): FormState => {
        return {
            displayValidation: false,
            status: FormStatus.IDLE,
            showLogs: false,
            exitWhenLogsClose: false,
            logToken: null,
            error: null,
        };
    },
    resourceConfig: () => {
        return {};
    },
};

export const getInitialStateData = (
    includeCollections: boolean,
    messagePrefix: Stores
): Pick<
    CreateEntityStore,
    | 'details'
    | 'endpointConfig'
    | 'connectors'
    | 'formState'
    | 'endpointSchema'
    | 'collections'
    | 'resourceConfig'
    | 'messagePrefix'
> => {
    return {
        messagePrefix,
        details: initialCreateStates.details(),
        endpointConfig: initialCreateStates.endpointConfig(),
        connectors: initialCreateStates.connectors(),
        formState: initialCreateStates.formState(),
        endpointSchema: initialCreateStates.endpointSchema(),
        resourceConfig: initialCreateStates.resourceConfig(),
        collections: includeCollections
            ? initialCreateStates.collections()
            : null,
    };
};

export const getInitialCreateState = (
    set: NamedSet<CreateEntityStore>,
    get: GetState<CreateEntityStore>,
    includeCollections: boolean,
    messagePrefix: Stores
): CreateEntityStore => {
    return {
        ...getInitialStateData(includeCollections, messagePrefix),
        setDetails: (details) => {
            set(
                produce((state) => {
                    if (
                        state.details.data.connectorImage?.id !==
                        details.data.connectorImage?.id
                    ) {
                        const initState = getInitialStateData(
                            includeCollections,
                            messagePrefix
                        );
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
                    const { formState } = getInitialStateData(
                        includeCollections,
                        messagePrefix
                    );
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
            } = getInitialStateData(includeCollections, messagePrefix);

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
        setResourceConfig: (key, value) => {
            set(
                produce((state) => {
                    state.resourceConfig[key] =
                        value ?? getDefaultJsonFormsData();
                }),
                false,
                'Resource Config Changed'
            );
        },
        getResourceConfigErrors: () => {
            const { resourceConfig } = get();
            let response: any[] = [];

            if (Object.keys(resourceConfig).length > 0) {
                map(resourceConfig, (config) => {
                    const { errors } = config;
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (errors && errors.length > 0) {
                        response = response.concat(errors);
                    }
                });
            } else {
                // TODO (errors) Need to populate this object with something?
                response = [{}];
            }

            return response;
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
                    const collections: string[] = [];
                    const configs = {};

                    value.forEach((collection) => {
                        collection.writes_to.forEach((writes_to) => {
                            collections.push(writes_to);
                            configs[writes_to] = getDefaultJsonFormsData();
                        });
                    });

                    state.collections = collections;
                    state.resourceConfig = configs;
                }),
                false,
                'Collections Prefilled'
            );
        },

        resetState: () => {
            set(
                getInitialStateData(includeCollections, messagePrefix),
                false,
                'Resetting State'
            );
        },
    };
};

export const entityCreateStoreSelectors = {
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
        errors: (state: CreateEntityStore) => state.endpointConfig.errors,
    },
    formState: {
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
    resourceConfig: {
        get: (state: CreateEntityStore) => state.resourceConfig,
        set: (state: CreateEntityStore) => state.setResourceConfig,
        getErrors: (state: CreateEntityStore) => state.getResourceConfigErrors,
    },

    connectors: (state: CreateEntityStore) => state.connectors,
    endpointSchema: (state: CreateEntityStore) => state.endpointSchema,
    setEndpointSchema: (state: CreateEntityStore) => state.setEndpointSchema,

    collections: (state: CreateEntityStore) => state.collections,
    setCollections: (state: CreateEntityStore) => state.setCollections,
    prefillCollections: (state: CreateEntityStore) => state.prefillCollections,

    messagePrefix: (state: CreateEntityStore) => state.messagePrefix,

    resetState: (state: CreateEntityStore) => state.resetState,
    hasChanges: (state: CreateEntityStore) => state.hasChanges,
    errors: (state: CreateEntityStore) => [
        state.details.errors,
        state.endpointConfig.errors,
    ],
};
