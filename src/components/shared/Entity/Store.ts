import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/postgrest-js';
import produce from 'immer';
import { isEqual } from 'lodash';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        description?: string;
        name: string;
        prefix: {
            const: string;
            title: string;
        };
        image?: {
            id: string;
            iconPath: string;
        };
    };
}

interface EndpointConfig extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        [key: string]: any;
    };
}

export enum FormStatus {
    SAVING = 'saving',
    TESTING = 'testing',
    IDLE = 'idle',
    GENERATING_PREVIEW = 'Generating Preview',
}

interface FormState {
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

export interface EntityStoreState {
    //Details
    details: Details;
    setDetails: (details: Details) => void;

    //Spec
    spec: EndpointConfig;
    setSpec: (spec: EndpointConfig) => void;

    formState: FormState;
    setFormState: (data: Partial<FormState>) => void;
    resetFormState: (status: FormStatus) => void;

    //Misc
    connectors: { [key: string]: any }[];
    setConnectors: (val: { [key: string]: any }[]) => void;
    resetState: () => void;
    hasChanges: () => boolean;
}

const getInitialStateData = (): Pick<
    EntityStoreState,
    'details' | 'spec' | 'connectors' | 'formState'
> => {
    return {
        details: {
            data: {
                image: {
                    id: '',
                    iconPath: '',
                },
                name: '',
                prefix: {
                    const: '',
                    title: '',
                },
            },
            errors: [],
        },
        spec: {
            data: {},
            errors: [],
        },
        connectors: [],
        formState: {
            displayValidation: false,
            status: FormStatus.IDLE,
            showLogs: false,
            exitWhenLogsClose: false,
            logToken: null,
            saveStatus: 'running...',
            error: null,
        },
    };
};

const useEntityStore = create<EntityStoreState>()(
    devtools(
        (set, get) => ({
            ...getInitialStateData(),
            setDetails: (details) => {
                set(
                    produce((state) => {
                        if (
                            state.details.data.image?.id !==
                            details.data.image?.id
                        ) {
                            const initState = getInitialStateData();
                            state.spec = initState.spec;
                            state.formState = initState.formState;
                        }

                        state.details = details;
                    }),
                    false,
                    'Details changed'
                );
            },

            setSpec: (spec) => {
                set(
                    produce((state) => {
                        state.spec = spec;
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
                const { details, spec } = get();
                const { details: initialDetails, spec: initialSpec } =
                    getInitialStateData();

                return !isEqual(
                    {
                        details: details.data,
                        spec: spec.data,
                    },
                    {
                        details: initialDetails.data,
                        spec: initialSpec.data,
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
            resetState: () => {
                set(getInitialStateData(), false, 'Resetting State');
            },
        }),
        devtoolsOptions('entity-foo-state')
    )
);

export default useEntityStore;

export const fooSelectors = {
    entityName: (state: EntityStoreState) => state.details.data.name,
    connectorTag: (state: EntityStoreState) => state.details.data.image,
    description: (state: EntityStoreState) => state.details.data.description,
    prefix: (state: EntityStoreState) => state.details.data.prefix.title,
    setDetails: (state: EntityStoreState) => state.setDetails,
    resetState: (state: EntityStoreState) => state.resetState,
    hasChanges: (state: EntityStoreState) => state.hasChanges,
    errors: (state: EntityStoreState) => [
        state.details.errors,
        state.spec.errors,
    ],
    endpointConfig: (state: EntityStoreState) => state.spec.data,
    setEndpointConfig: (state: EntityStoreState) => state.setSpec,
    connectors: (state: EntityStoreState) => state.connectors,
    setFormState: (state: EntityStoreState) => state.setFormState,
    resetFormState: (state: EntityStoreState) => state.resetFormState,
    formStateSaveStatus: (state: EntityStoreState) =>
        state.formState.saveStatus,
    formStateStatus: (state: EntityStoreState) => state.formState.status,
    showLogs: (state: EntityStoreState) => state.formState.showLogs,
    logToken: (state: EntityStoreState) => state.formState.logToken,
    error: (state: EntityStoreState) => state.formState.error,
    exitWhenLogsClose: (state: EntityStoreState) =>
        state.formState.exitWhenLogsClose,
    displayValidation: (state: EntityStoreState) =>
        state.formState.displayValidation,
    status: (state: EntityStoreState) => state.formState.status,
};
