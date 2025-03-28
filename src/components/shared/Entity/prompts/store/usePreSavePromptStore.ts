import { useMemo } from 'react';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { getInitialDataFlowResetContext } from '../steps/dataFlowReset/shared';
import { defaultStepState } from './shared';
import { PreSavePromptStore } from './types';
import produce from 'immer';

import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { logRocketEvent } from 'src/services/shared';
import { JOB_STATUS_FAILURE, JOB_STATUS_SUCCESS } from 'src/services/supabase';
import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialState = (): Pick<
    PreSavePromptStore,
    'activeStep' | 'steps' | 'context' | 'initUUID'
> => ({
    activeStep: 0,
    initUUID: null,
    steps: [],
    context: getInitialDataFlowResetContext(),
});

export const usePreSavePromptStore = create<PreSavePromptStore>()(
    devtools((set) => {
        return {
            ...getInitialState(),
            resetState: () => set(getInitialState(), false, 'resetState'),

            initializeSteps: (settings) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        state.context.loggingEvent = settings.loggingEvent;
                        state.context.dialogMessageId =
                            settings.dialogMessageId;
                        state.steps = settings.steps;

                        const initUUID = crypto.randomUUID();
                        state.initUUID = initUUID;
                        logRocketEvent(state.context.loggingEvent, {
                            step: 'init',
                            initUUID,
                        });
                    }),
                    false,
                    'initializeSteps'
                ),

            retryStep: (stepToUpdate) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        const updating = state.steps[stepToUpdate];

                        updating.state.progress = defaultStepState.progress;
                        updating.state.error = defaultStepState.error;

                        logRocketEvent(state.context.loggingEvent, {
                            step: updating.StepComponent.name,
                            retry: true,
                        });
                    }),
                    false,
                    'retryStep'
                ),

            updateStep: (stepToUpdate, settings) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        const updating = state.steps[stepToUpdate];

                        updating.state = {
                            ...updating.state,
                            ...settings,
                        };

                        const newStatus =
                            settings.publicationStatus?.job_status.type;
                        if (newStatus) {
                            if (JOB_STATUS_SUCCESS.includes(newStatus)) {
                                updating.state.progress =
                                    ProgressStates.SUCCESS;
                                updating.state.valid = true;
                                updating.state.error = null;
                            } else if (JOB_STATUS_FAILURE.includes(newStatus)) {
                                updating.state.progress = ProgressStates.FAILED;
                                updating.state.valid = false;
                                updating.state.error = {
                                    message:
                                        'resetDataFlow.errors.publishFailed',
                                };
                            }
                        }

                        logRocketEvent(state.context.loggingEvent, {
                            step: updating.StepComponent.name,
                            progress: updating.state.progress,
                        });
                    }),
                    false,
                    'setActiveStep'
                ),

            updateContext: (settings) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        state.context = {
                            ...state.context,
                            ...settings,
                        };

                        logRocketEvent(state.context.loggingEvent, {
                            contextUpdate: true,
                            ...settings,
                        });
                    }),
                    false,
                    'updateContext'
                ),

            setActiveStep: (value) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        state.activeStep = value;
                    }),
                    false,
                    'setActiveStep'
                ),

            nextStep: (skipped) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        // TODO (data flow reset)
                        // Want to think more about allowing this
                        if (skipped) {
                            state.steps[state.activeStep].state.valid = true;
                        }

                        if (state.steps[state.activeStep].state.valid) {
                            state.steps[state.activeStep].state.progress =
                                skipped
                                    ? ProgressStates.SKIPPED
                                    : ProgressStates.SUCCESS;
                            state.activeStep = state.activeStep + 1;
                        }
                    }),
                    false,
                    'nextStep'
                ),

            previousStep: () =>
                set(
                    produce((state: PreSavePromptStore) => {
                        const newVal = state.activeStep - 1;
                        state.activeStep = newVal >= 0 ? newVal : 0;
                    }),
                    false,
                    'previousStep'
                ),
        };
    }, devtoolsOptions('estuary.presave-prompt-store'))
);

export const usePreSavePromptStore_activeStep = () => {
    return usePreSavePromptStore(
        useShallow((state) => {
            return state.steps[state.activeStep]?.state;
        })
    );
};

export const usePreSavePromptStore_stepValid = () => {
    return usePreSavePromptStore(
        useShallow((state) => state.steps[state.activeStep]?.state.valid)
    );
};

export const usePreSavePromptStore_onFirstStep = () => {
    return usePreSavePromptStore(
        useShallow((state) => {
            return state.activeStep === 0;
        })
    );
};

export const usePreSavePromptStore_onLastStep = () => {
    return usePreSavePromptStore(
        useShallow((state) => {
            return state.activeStep === state.steps.length - 1;
        })
    );
};

export const usePreSavePromptStore_done = () => {
    const last = usePreSavePromptStore_onLastStep();
    const done = usePreSavePromptStore_stepValid();

    return useMemo(() => last && done, [done, last]);
};
