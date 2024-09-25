import produce from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { devtoolsOptions } from 'utils/store-utils';
import { useShallow } from 'zustand/react/shallow';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { JOB_STATUS_FAILURE, JOB_STATUS_SUCCESS } from 'services/supabase';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { PromptStep } from '../types';
import { DataFlowResetSteps } from '../steps/dataFlowReset/shared';
import { ChangeReviewStep } from '../steps/preSave/ChangeReview/definition';
import { PublishStep } from '../steps/preSave/Publish/definition';
import { PreSavePromptStore } from './types';

const getInitialState = (): Pick<
    PreSavePromptStore,
    'activeStep' | 'steps' | 'context' | 'initUUID'
> => ({
    activeStep: 0,
    initUUID: null,
    steps: [],
    context: {},
});

export const usePreSavePromptStore = create<PreSavePromptStore>()(
    devtools((set) => {
        return {
            ...getInitialState(),
            resetState: () => set(getInitialState(), false, 'resetState'),

            initializeSteps: (backfillEnabled) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        const initUUID = crypto.randomUUID();
                        const newSteps: PromptStep[] = [ChangeReviewStep];

                        if (backfillEnabled) {
                            newSteps.push(...DataFlowResetSteps);
                        }

                        newSteps.push(PublishStep);

                        state.steps = newSteps;
                        state.initUUID = initUUID;
                        logRocketEvent(CustomEvents.BACKFILL_DATAFLOW, {
                            step: 'init',
                            initUUID,
                        });
                    }),
                    false,
                    'initializeSteps'
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
                                        'dataFlowReset.errors.publishFailed',
                                };
                            }
                        }

                        logRocketEvent(CustomEvents.BACKFILL_DATAFLOW, {
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

            nextStep: () =>
                set(
                    produce((state: PreSavePromptStore) => {
                        if (state.steps[state.activeStep].state.valid) {
                            state.steps[state.activeStep].state.progress =
                                ProgressStates.SUCCESS;
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
