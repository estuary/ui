import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/postgrest-js';
import produce from 'immer';
import { isEqual } from 'lodash';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        name: string;
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

export interface FooState {
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
    FooState,
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

const useFooStore = create<FooState>()(
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

export default useFooStore;

export const fooSelectors = {
    entityName: (state: FooState) => state.details.data.name,
    connectorTag: (state: FooState) => state.details.data.image,
    setDetails: (state: FooState) => state.setDetails,
    resetState: (state: FooState) => state.resetState,
    hasChanges: (state: FooState) => state.hasChanges,
    errors: (state: FooState) => [state.details.errors, state.spec.errors],
    endpointConfig: (state: FooState) => state.spec.data,
    setEndpointConfig: (state: FooState) => state.setSpec,
    connectors: (state: FooState) => state.connectors,
    setFormState: (state: FooState) => state.setFormState,
    resetFormState: (state: FooState) => state.resetFormState,
    formStateSaveStatus: (state: FooState) => state.formState.saveStatus,
    formStateStatus: (state: FooState) => state.formState.status,
    showLogs: (state: FooState) => state.formState.showLogs,
    logToken: (state: FooState) => state.formState.logToken,
    error: (state: FooState) => state.formState.error,
    exitWhenLogsClose: (state: FooState) => state.formState.exitWhenLogsClose,
    displayValidation: (state: FooState) => state.formState.displayValidation,
    status: (state: FooState) => state.formState.status,
};
