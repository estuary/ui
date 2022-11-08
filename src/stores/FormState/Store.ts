import produce from 'immer';
import { MessagePrefixes } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { FormStateStoreNames } from '../names';
import { EntityFormState, FormStatus } from './types';

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
    'formState' | 'isIdle' | 'isActive' | 'messagePrefix'
> => ({
    formState: initialFormState,

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
                const { formState } = get();

                state.formState = { ...formState, ...newState };
                state.isIdle = formIdle(state.formState.status);
                state.isActive = formActive(state.formState.status);
            }),
            false,
            'Form State Changed'
        );
    },

    updateStatus: (status) => {
        set(
            produce((state: EntityFormState) => {
                state.formState = { ...initialFormState };
                state.formState.status = status;
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
