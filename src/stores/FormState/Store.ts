import produce from 'immer';
import { logRocketConsole } from 'services/shared';
import { CustomEvents } from 'services/types';
import { MessagePrefixes } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { FormStateStoreNames } from '../names';
import { EntityFormState, FormState, FormStatus } from './types';

const formActive = (status: FormStatus) => {
    return (
        status === FormStatus.TESTING ||
        status === FormStatus.GENERATING ||
        status === FormStatus.SAVING ||
        status === FormStatus.SCHEMA_EVOLVING ||
        status === FormStatus.UPDATING
    );
};

const formIdle = (status: FormStatus) => {
    return (
        status === FormStatus.TESTED ||
        status === FormStatus.INIT ||
        status === FormStatus.SAVED ||
        status === FormStatus.GENERATED ||
        status === FormStatus.SCHEMA_EVOLVED ||
        status === FormStatus.UPDATED
    );
};

const getMessageSettings = (
    formStatus: FormStatus,
    isActive: boolean
): FormState['message'] => {
    if (formStatus === FormStatus.TESTED || formStatus === FormStatus.SAVED) {
        return {
            key: 'common.success',
            severity: 'success',
        };
    } else if (formStatus === FormStatus.FAILED) {
        return {
            key: 'common.fail',
            severity: 'error',
        };
    } else if (isActive) {
        let key = 'common.running';
        if (formStatus === FormStatus.TESTING) {
            key = 'common.testing';
        } else if (formStatus === FormStatus.SAVING) {
            key = 'common.publishing';
        }

        return {
            key,
            severity: null,
        };
    }

    return {
        key: null,
        severity: null,
    };
};

const initialFormState = {
    displayValidation: false,
    status: FormStatus.INIT,
    showLogs: false,
    exitWhenLogsClose: false,
    logToken: null,
    error: null,
    message: {
        key: null,
        severity: null,
    },
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
                const { formState } = state;

                if (
                    formState.status === FormStatus.INIT &&
                    (newState.status === FormStatus.TESTED ||
                        newState.status === FormStatus.SAVED)
                ) {
                    // If we are trying to go directly from init to tested/saved then
                    //  we are probably still running an async task that is not needed.
                    // Ex: enter edit materialization, click back quickly, and then  the test finishes
                    logRocketConsole(CustomEvents.FORM_STATE_PREVENTED);
                    return;
                }

                if (
                    formState.status === FormStatus.SAVING &&
                    newState.status === FormStatus.TESTED
                ) {
                    // If we are here this means a user has started saving while a test was in progress.
                    //  This almost always means that a user started running a save while the background
                    //  test for field selection was still running.
                    logRocketConsole(CustomEvents.FORM_STATE_SKIPPED);
                    return;
                }

                state.formState = { ...formState, ...newState };
                state.isIdle = formIdle(state.formState.status);

                const formIsActive = formActive(state.formState.status);
                state.isActive = formIsActive;
                state.formState.message = getMessageSettings(
                    state.formState.status,
                    formIsActive
                );
            }),
            false,
            'Form State Changed'
        );
    },

    updateStatus: (status, runInBackground) => {
        set(
            produce((state: EntityFormState) => {
                state.formState = { ...initialFormState };
                state.formState.status =
                    runInBackground && status === FormStatus.TESTING
                        ? FormStatus.TESTING_BACKGROUND
                        : status;

                state.isIdle = formIdle(status);

                const formIsActive = formActive(status);
                state.isActive = formIsActive;
                state.formState.message = getMessageSettings(
                    state.formState.status,
                    formIsActive
                );
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
