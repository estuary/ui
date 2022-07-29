import { PostgrestError } from '@supabase/postgrest-js';
import { FormStateStoreNames } from 'context/Zustand';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

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

export interface EntityFormState {
    // Form State
    formState: FormState;
    setFormState: (data: Partial<FormState>) => void;
    resetFormState: (status: FormStatus) => void;

    // Form Status
    isIdle: boolean;
    isActive: boolean;

    // Misc.
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
    EntityFormState,
    'formState' | 'isIdle' | 'isActive'
> => ({
    formState: initialFormState,

    isIdle: true,
    isActive: false,
});

const getInitialState = (
    set: NamedSet<EntityFormState>,
    get: StoreApi<EntityFormState>['getState']
): EntityFormState => ({
    ...getInitialStateData(),

    setFormState: (newState) => {
        set(
            produce((state: EntityFormState) => {
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
            produce((state: EntityFormState) => {
                state.formState = { ...initialFormState };
                state.formState.status = status;
                state.isIdle = formIdle(status);
                state.isActive = formActive(status);
            }),
            false,
            'Form State Reset'
        );
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Entity Form State Reset');
    },
});

export const createFormStateStore = (key: FormStateStoreNames) => {
    return create<EntityFormState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
