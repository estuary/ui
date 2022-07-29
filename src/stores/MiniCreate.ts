import { JsonFormsCore } from '@jsonforms/core';
import { PostgrestError } from '@supabase/postgrest-js';
import { DetailsFormStoreNames } from 'context/Zustand';
import produce from 'immer';
import { isEmpty, isEqual } from 'lodash';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

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

interface FormState {
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
    INIT = 'IDLE',

    SAVING = 'SAVING',
    SAVED = 'SAVED',

    TESTING = 'TESTING',
    TESTED = 'TESTED',

    GENERATING = 'GENERATING_PREVIEW',
    GENERATED = 'GENERATED_PREVIEW',

    FAILED = 'FAILED',
}

export interface CreateState {
    // Form Data
    details: Details;
    setDetails: (details: Details) => void;

    detailsFormErrorsExist: boolean;

    // Connectors
    connectors: { [key: string]: any }[];
    setConnectors: (val: CreateState['connectors']) => void;

    // Form State
    formState: FormState;
    setFormState: (data: Partial<FormState>) => void;
    resetFormState: (status: FormStatus) => void;

    // Form Status
    isIdle: boolean;
    isActive: boolean;

    // Misc.
    stateChanged: () => boolean;
    resetState: () => void;
}

const formActive = (status: FormStatus) => {
    return (
        status === FormStatus.TESTING ||
        status === FormStatus.GENERATING ||
        status === FormStatus.SAVING
    );
};

const formIdle = (status: FormStatus) => {
    return (
        status === FormStatus.TESTED ||
        status === FormStatus.INIT ||
        status === FormStatus.SAVED ||
        status === FormStatus.GENERATED
    );
};

const initialFormState = {
    displayValidation: false,
    status: FormStatus.INIT,
    showLogs: false,
    exitWhenLogsClose: false,
    logToken: null,
    error: null,
};

const getInitialStateData = (): Pick<
    CreateState,
    | 'details'
    | 'detailsFormErrorsExist'
    | 'connectors'
    | 'formState'
    | 'isIdle'
    | 'isActive'
> => ({
    details: {
        data: {
            connectorImage: {
                id: '',
                iconPath: '',
            },
            entityName: '',
        },
        errors: [],
    },
    detailsFormErrorsExist: true,

    connectors: [],

    formState: initialFormState,

    isIdle: true,
    isActive: false,
});

const getInitialState = (
    set: NamedSet<CreateState>,
    get: StoreApi<CreateState>['getState']
): CreateState => ({
    ...getInitialStateData(),

    setDetails: (details) => {
        set(
            produce((state: CreateState) => {
                if (!details.data.connectorImage) {
                    // TODO: Reset the endpoint config form in the effect of the calling component.

                    details.data.connectorImage =
                        getInitialStateData().details.data.connectorImage;
                } else if (
                    state.details.data.connectorImage?.id !==
                    details.data.connectorImage.id
                ) {
                    const { status } = initialFormState;

                    state.formState = initialFormState;
                    state.isIdle = formIdle(status);
                    state.isActive = formActive(status);
                }

                state.details = details;

                state.detailsFormErrorsExist = !isEmpty(
                    details.errors ?? get().details.errors
                );
            }),
            false,
            'Details Changed'
        );
    },

    setConnectors: (val) => {
        set(
            produce((state: CreateState) => {
                state.connectors = val;
            }),
            false,
            'Connector Response Cached'
        );
    },

    setFormState: (newState) => {
        set(
            produce((state: CreateState) => {
                const { formState } = get();

                state.formState = { ...formState, ...newState };
                state.isIdle = formIdle(state.formState.status);
                state.isActive = formActive(state.formState.status);
            }),
            false,
            'Form State Changed'
        );
    },

    resetFormState: (status) => {
        set(
            produce((state: CreateState) => {
                state.formState = { ...initialFormState };
                state.formState.status = status;
                state.isIdle = formIdle(status);
                state.isActive = formActive(status);
            }),
            false,
            'Form State Reset'
        );
    },

    stateChanged: () => {
        const { details } = get();
        const { details: initialDetails } = getInitialStateData();

        return !isEqual(details.data, initialDetails.data);
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Create State Reset');
    },
});

export const createEntityCreateStore = (key: DetailsFormStoreNames) => {
    return create<CreateState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
