import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/postgrest-js';
import produce from 'immer';
import { isEqual } from 'lodash';
import { devtoolsInNonProd } from 'utils/store-utils';
import create from 'zustand';

interface CreationDetails extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        name: string;
        image: string;
    };
}

interface CreationSpec extends Pick<JsonFormsCore, 'data' | 'errors'> {
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
    spec: CreationSpec;
    setSpec: (spec: CreationSpec) => void;

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
    'details' | 'spec' | 'connectors' | 'collections' | 'formState'
> => {
    return {
        details: {
            data: { image: '', name: '' },
            errors: [],
        },
        spec: {
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

const useMaterializationCreationStore = create<CreationState>(
    devtoolsInNonProd(
        (set, get) => ({
            ...getInitialStateData(),
            setDetails: (details) => {
                set(
                    produce((state) => {
                        if (
                            details.data.image.length > 0 &&
                            state.details.data.image !== details.data.image
                        ) {
                            const initState = getInitialStateData();

                            state.spec = initState.spec;
                            state.formState = initState.formState;
                        }

                        state.details = details;
                    }),
                    false,
                    'Details Changed'
                );
            },

            setSpec: (spec) => {
                set(
                    produce((state) => {
                        state.spec = spec;
                    }),
                    false,
                    'Spec Changed'
                );
            },

            setCollections: (collections) => {
                set(
                    produce((state) => {
                        state.collections = collections;
                    }),
                    false,
                    'Collections Changed'
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
                    'Form State Changed'
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
                    'Connector Response Cached'
                );
            },
            resetState: () => {
                set(getInitialStateData(), false, 'State Reset');
            },
        }),
        { name: 'materialization-creation-state' }
    )
);

export default useMaterializationCreationStore;
