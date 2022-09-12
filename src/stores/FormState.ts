import { PostgrestError } from '@supabase/postgrest-js';
import { useEntityWorkflow } from 'context/Workflow';
import { FormStateStoreNames, useZustandStore } from 'context/Zustand';
import produce from 'immer';
import { EntityWorkflow, MessagePrefixes } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

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
    INIT = 'IDLE',

    SAVING = 'SAVING',
    SAVED = 'SAVED',

    TESTING = 'TESTING',
    TESTED = 'TESTED',

    GENERATING = 'GENERATING_PREVIEW',
    GENERATED = 'GENERATED_PREVIEW',

    FAILED = 'FAILED',
}

export interface EntityFormState {
    // Form State
    displayValidation: boolean;

    logToken: string | null;
    showLogs: boolean;
    exitWhenLogsClose: boolean;

    error: {
        title: string;
        error?: PostgrestError;
    } | null;

    setFormState: (data: Partial<FormState>) => void;

    // Form Status
    status: FormStatus;
    isIdle: boolean;
    isActive: boolean;

    updateStatus: (status: FormStatus) => void;

    // Misc.
    resetState: () => void;
    messagePrefix: MessagePrefixes;
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

const getInitialStateData = (
    messagePrefix: MessagePrefixes
): Pick<
    EntityFormState,
    | 'displayValidation'
    | 'status'
    | 'showLogs'
    | 'exitWhenLogsClose'
    | 'logToken'
    | 'error'
    | 'isIdle'
    | 'isActive'
    | 'messagePrefix'
> => ({
    ...initialFormState,

    isIdle: true,
    isActive: false,

    messagePrefix,
});

const getInitialState = (
    set: NamedSet<EntityFormState>,
    get: StoreApi<EntityFormState>['getState'],
    messagePrefix: MessagePrefixes
): EntityFormState => ({
    ...getInitialStateData(messagePrefix),

    setFormState: (newState) => {
        set(
            produce((state: EntityFormState) => {
                state = { ...state, ...newState };
                state.isIdle = formIdle(state.status);
                state.isActive = formActive(state.status);
            }),
            false,
            'Form State Changed'
        );
    },

    updateStatus: (status) => {
        set(
            produce((state: EntityFormState) => {
                state = { ...state, ...initialFormState };

                state.status = status;
                state.isIdle = formIdle(status);
                state.isActive = formActive(status);
            }),
            false,
            'Form Status Updated'
        );
    },

    resetState: () => {
        set(
            getInitialStateData(messagePrefix),
            false,
            'Entity Form State Reset'
        );
    },
});

export const createFormStateStore = (
    key: FormStateStoreNames,
    messagePrefix: MessagePrefixes
) => {
    return create<EntityFormState>()(
        devtools(
            (set, get) => getInitialState(set, get, messagePrefix),
            devtoolsOptions(key)
        )
    );
};

// Selector Hooks
const storeName = (workflow: EntityWorkflow): FormStateStoreNames => {
    switch (workflow) {
        case 'capture_create':
            return FormStateStoreNames.CAPTURE_CREATE;
        case 'capture_edit':
            return FormStateStoreNames.CAPTURE_EDIT;
        case 'materialization_create':
            return FormStateStoreNames.MATERIALIZATION_CREATE;
        case 'materialization_edit':
            return FormStateStoreNames.MATERIALIZATION_EDIT;
        default: {
            throw new Error('Invalid FormState store name');
        }
    }
};

export const useFormStateStore_displayValidation = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<
        EntityFormState,
        EntityFormState['displayValidation']
    >(storeName(workflow), (state) => state.displayValidation);
};

export const useFormStateStore_status = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['status']>(
        storeName(workflow),
        (state) => state.status
    );
};

export const useFormStateStore_showLogs = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['showLogs']>(
        storeName(workflow),
        (state) => state.showLogs
    );
};

export const useFormStateStore_exitWhenLogsClose = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<
        EntityFormState,
        EntityFormState['exitWhenLogsClose']
    >(storeName(workflow), (state) => state.exitWhenLogsClose);
};

export const useFormStateStore_logToken = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['logToken']>(
        storeName(workflow),
        (state) => state.logToken
    );
};

export const useFormStateStore_error = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['error']>(
        storeName(workflow),
        (state) => state.error
    );
};

export const useFormStateStore_setFormState = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['setFormState']>(
        storeName(workflow),
        (state) => state.setFormState
    );
};

export const useFormStateStore_updateStatus = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['updateStatus']>(
        storeName(workflow),
        (state) => state.updateStatus
    );
};

export const useFormStateStore_isIdle = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['isIdle']>(
        storeName(workflow),
        (state) => state.isIdle
    );
};
