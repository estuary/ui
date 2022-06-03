import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/postgrest-js';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { forEach, isEmpty, isEqual, map } from 'lodash';
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
    INIT = 'idle',

    SAVING = 'saving',
    SAVED = 'saved',

    TESTING = 'testing',
    TESTED = 'tested',

    GENERATING = 'Generating Preview',
    GENERATED = 'Generated Preview',

    SUCCESS = 'success',
    FAILED = 'failed',
}

export const formActive = (formStateStatus: FormStatus) => {
    return (
        formStateStatus === FormStatus.TESTING ||
        formStateStatus === FormStatus.GENERATING ||
        formStateStatus === FormStatus.SAVING
    );
};

const formIdle = (formStateStatus: FormStatus) => {
    return (
        formStateStatus === FormStatus.TESTED ||
        formStateStatus === FormStatus.INIT ||
        formStateStatus === FormStatus.SAVED ||
        formStateStatus === FormStatus.GENERATED
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
    detailsFormHasErrors: boolean;

    //Spec
    endpointConfig: JsonFormsData;
    setEndpointConfig: (endpointConfig: JsonFormsData) => void;
    endpointConfigHasErrors: boolean;

    // Resource Config
    resourceConfig: { [key: string]: ResourceConfig };
    setResourceConfig: (key: string, value?: ResourceConfig) => void;
    getResourceConfigErrors: () => any[];
    resourceConfigHasErrors: boolean;

    // Collection Selector
    collections: string[] | null;
    setCollections: (collections: string[]) => void;
    prefillCollections: (collections: LiveSpecsExtQuery[]) => void;
    collectionsHasErrors: boolean;

    //Form State
    formState: FormState;
    setFormState: (data: Partial<FormState>) => void;
    resetFormState: (status: FormStatus) => void;

    //Misc
    connectors: { [key: string]: any }[];
    setConnectors: (val: CreateEntityStore['connectors']) => void;
    endpointSchema: { [key: string]: any };
    setEndpointSchema: (val: CreateEntityStore['endpointSchema']) => void;
    isIdle: boolean;
    isActive: boolean;

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
            status: FormStatus.INIT,
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
    | 'resourceConfigHasErrors'
    | 'endpointConfigHasErrors'
    | 'detailsFormHasErrors'
    | 'collectionsHasErrors'
    | 'isIdle'
    | 'isActive'
> => {
    return {
        isIdle: true,
        isActive: false,

        messagePrefix,
        details: initialCreateStates.details(),
        detailsFormHasErrors: false,

        endpointConfig: initialCreateStates.endpointConfig(),
        endpointConfigHasErrors: false,

        connectors: initialCreateStates.connectors(),

        formState: initialCreateStates.formState(),

        endpointSchema: initialCreateStates.endpointSchema(),

        resourceConfig: initialCreateStates.resourceConfig(),
        resourceConfigHasErrors: false,

        collections: includeCollections
            ? initialCreateStates.collections()
            : null,
        collectionsHasErrors: includeCollections, // This defaults to true because collections starts empty
    };
};

const formHasErrors = (stateConfig: any) => {
    let hasErrors = false;
    if (Object.keys(stateConfig).length > 0) {
        forEach(stateConfig, (config) => {
            const { errors } = config;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (errors && errors.length > 0) {
                hasErrors = true;
            }

            return !hasErrors;
        });
    }
    return hasErrors;
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
                        const { endpointConfig, formState } =
                            getInitialStateData(
                                includeCollections,
                                messagePrefix
                            );
                        state.endpointConfig = endpointConfig;
                        state.formState = formState;

                        state.isIdle = formIdle(formState.status);
                        state.isActive = formActive(formState.status);
                    }

                    state.details = details;
                    state.detailsFormHasErrors =
                        details.errors && details.errors.length > 0;
                }),
                false,
                'Details changed'
            );
        },

        setEndpointConfig: (endpointConfig) => {
            set(
                produce((state) => {
                    state.endpointConfig = endpointConfig;
                    state.endpointConfigHasErrors =
                        endpointConfig.errors &&
                        endpointConfig.errors.length > 0;
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
                    state.isIdle = formIdle(state.formState.status);
                    state.isActive = formActive(state.formState.status);
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
                    state.isIdle = formIdle(status);
                    state.isActive = formActive(status);
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

                    state.resourceConfigHasErrors = formHasErrors(
                        state.resourceConfig
                    );
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
                    state.collectionsHasErrors = isEmpty(value);
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
                    state.collectionsHasErrors = isEmpty(collections);
                    state.resourceConfigHasErrors = formHasErrors(configs);
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
        hasErrors: (state: CreateEntityStore) => state.detailsFormHasErrors,
    },
    endpointConfig: {
        id: (state: CreateEntityStore) => state.endpointConfig.data.id,
        data: (state: CreateEntityStore) => state.endpointConfig.data,
        set: (state: CreateEntityStore) => state.setEndpointConfig,
        errors: (state: CreateEntityStore) => state.endpointConfig.errors,
        hasErrors: (state: CreateEntityStore) => state.endpointConfigHasErrors,
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
        hasErrors: (state: CreateEntityStore) => state.resourceConfigHasErrors,
    },

    connectors: (state: CreateEntityStore) => state.connectors,
    endpointSchema: (state: CreateEntityStore) => state.endpointSchema,
    setEndpointSchema: (state: CreateEntityStore) => state.setEndpointSchema,

    collections: (state: CreateEntityStore) => state.collections,
    setCollections: (state: CreateEntityStore) => state.setCollections,
    prefillCollections: (state: CreateEntityStore) => state.prefillCollections,
    collectionsHasErrors: (state: CreateEntityStore) =>
        state.collectionsHasErrors,

    messagePrefix: (state: CreateEntityStore) => state.messagePrefix,
    isActive: (state: CreateEntityStore) => state.isActive,
    isIdle: (state: CreateEntityStore) => state.isIdle,

    resetState: (state: CreateEntityStore) => state.resetState,
    hasChanges: (state: CreateEntityStore) => state.hasChanges,
    errors: (state: CreateEntityStore) => [
        state.details.errors,
        state.endpointConfig.errors,
    ],
};
