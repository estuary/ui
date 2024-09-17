import produce from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { devtoolsOptions } from 'utils/store-utils';
import { useShallow } from 'zustand/react/shallow';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { PromptStep, PromptStepState } from '../types';
import ChangeReview from '../steps/preSave/ChangeReview';
import { DataFlowResetSteps } from '../steps/dataFlowReset/shared';
import Publish from '../steps/preSave/Publish';
import { defaultStepState } from './shared';

interface PreSavePromptStore {
    steps: PromptStep[] | null;
    updateStep: (settings: Partial<PromptStepState>, step?: number) => void;
    initializeSteps: (backfillEnabled: boolean) => void;

    activeStep: number;
    setActiveStep: (val: PreSavePromptStore['activeStep']) => void;
    nextStep: () => void;
    previousStep: () => void;

    show: boolean;
    setShow: (data: PreSavePromptStore['show']) => void;

    resetState: () => void;
}

const getInitialState = (): Pick<
    PreSavePromptStore,
    'activeStep' | 'steps' | 'show'
> => ({
    activeStep: 0,
    show: false,
    steps: null,
});

const name = 'estuary.presave-prompt-store';

export const usePreSavePromptStore = create<PreSavePromptStore>()(
    devtools((set) => {
        return {
            ...getInitialState(),
            resetState: () => set(getInitialState(), false, 'state reset'),

            initializeSteps: (backfillEnabled) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        const newSteps: PromptStep[] = [
                            {
                                StepComponent: ChangeReview,
                                stepLabelMessageId:
                                    'preSavePrompt.changeReview.title',
                                state: {
                                    ...defaultStepState,
                                    valid: true,
                                },
                            },
                        ];

                        if (backfillEnabled) {
                            newSteps.push(...DataFlowResetSteps);
                        }

                        newSteps.push({
                            StepComponent: Publish,
                            stepLabelMessageId: 'preSavePrompt.publish.title',
                            state: defaultStepState,
                        });
                        state.steps = newSteps;
                    }),
                    false,
                    'initializeSteps'
                ),

            updateStep: (settings, step) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        if (!state.steps) {
                            return;
                        }

                        const stepToUpdate = step ?? state.activeStep;

                        state.steps[stepToUpdate].state = {
                            ...state.steps[stepToUpdate].state,
                            ...settings,
                        };
                    }),
                    false,
                    'setActiveStep'
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
                        if (!state.steps) {
                            return;
                        }

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
                        state.activeStep = state.activeStep - 1;
                    }),
                    false,
                    'nextStep'
                ),

            setShow: (val) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        state.show = val;
                    }),
                    false,
                    'setShow'
                ),
        };
    }, devtoolsOptions(name))
);

export const usePreSavePromptStore_activeStep = () => {
    return usePreSavePromptStore(
        useShallow((state) => {
            return state.steps?.[state.activeStep]?.state;
        })
    );
};

export const usePreSavePromptStore_onFirstStep = () => {
    return usePreSavePromptStore(
        useShallow((state) => {
            return state.activeStep === 0;
        })
    );
};
