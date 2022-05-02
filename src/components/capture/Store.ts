import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/postgrest-js';
import produce from 'immer';
import { isEqual } from 'lodash';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

export interface CaptureCreationDetails
    extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        name: string;
        image?: {
            id: string;
            iconPath: string;
        };
    };
}

interface CaptureCreationSpec extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        [key: string]: any;
    };
}

export enum CaptureCreationFormStatus {
    SAVING = 'saving',
    TESTING = 'testing',
    IDLE = 'idle',
}

interface CaptureCreationFormState {
    showValidation: boolean;
    status: CaptureCreationFormStatus;
    showLogs: boolean;
    saveStatus: string;
    exitWhenLogsClose: boolean;
    logToken: string | null;
    error: {
        title: string;
        error?: PostgrestError;
    } | null;
}

export interface CaptureCreationState {
    //Details
    details: CaptureCreationDetails;
    setDetails: (details: CaptureCreationDetails) => void;

    //Spec
    spec: CaptureCreationSpec;
    setSpec: (spec: CaptureCreationSpec) => void;

    formState: CaptureCreationFormState;
    setFormState: (data: Partial<CaptureCreationFormState>) => void;
    resetFormState: (status: CaptureCreationFormStatus) => void;

    //Misc
    connectors: { [key: string]: any }[];
    setConnectors: (val: { [key: string]: any }[]) => void;
    resetState: () => void;
    hasChanges: () => boolean;
}

const getInitialStateData = (): Pick<
    CaptureCreationState,
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
            showValidation: false,
            status: CaptureCreationFormStatus.IDLE,
            showLogs: false,
            exitWhenLogsClose: false,
            logToken: null,
            saveStatus: 'running...',
            error: null,
        },
    };
};

const useCaptureCreationStore = create<CaptureCreationState>()(
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
                    'Spec changed'
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
        devtoolsOptions('capture-creation-state')
    )
);

export default useCaptureCreationStore;
