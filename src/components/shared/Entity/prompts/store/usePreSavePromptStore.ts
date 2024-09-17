import produce from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { devtoolsOptions } from 'utils/store-utils';
import { useShallow } from 'zustand/react/shallow';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { PromptStep, PromptStepState } from '../types';
import {
    DataFlowResetSteps,
    DataFlowSteps,
} from '../steps/dataFlowReset/shared';
import { ChangeReviewStep } from '../steps/preSave/ChangeReview/definition';
import { PublishStep } from '../steps/preSave/Publish/definition';

interface PreSavePromptStore {
    steps: PromptStep[] | null;
    machine: any;
    updateMachine: (key: string, settings: Partial<PromptStep>) => void;

    updateStep: (step: number, settings: Partial<PromptStepState>) => void;
    initializeSteps: (backfillEnabled: boolean) => void;

    activeStep: number;
    activeMachine: string;
    setActiveStep: (val: PreSavePromptStore['activeStep']) => void;
    nextStep: () => void;
    previousStep: () => void;

    show: boolean;
    setShow: (data: PreSavePromptStore['show']) => void;

    resetState: () => void;
}

const getInitialState = (): Pick<
    PreSavePromptStore,
    'activeStep' | 'activeMachine' | 'steps' | 'show' | 'machine'
> => ({
    activeStep: 0,
    activeMachine: 'changeReview',
    show: false,
    steps: null,
    machine: {},
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
                        const newSteps: PromptStep[] = [ChangeReviewStep];

                        if (backfillEnabled) {
                            newSteps.push(...DataFlowResetSteps);
                        }

                        newSteps.push(PublishStep);
                        state.steps = newSteps;

                        if (backfillEnabled) {
                            state.machine = {
                                changeReview: ChangeReviewStep,
                                ...DataFlowSteps,
                                saveAndPublish: PublishStep,
                            };
                        } else {
                            state.machine = {
                                changeReview: ChangeReviewStep,
                                saveAndPublish: PublishStep,
                            };
                        }
                    }),
                    false,
                    'initializeSteps'
                ),

            updateStep: (stepToUpdate, settings) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        if (!state.steps) {
                            return;
                        }

                        state.steps[stepToUpdate].state = {
                            ...state.steps[stepToUpdate].state,
                            ...settings,
                        };
                    }),
                    false,
                    'setActiveStep'
                ),

            updateMachine: (machineToUpdate, settings) =>
                set(
                    produce((state: PreSavePromptStore) => {
                        if (!state.machine) {
                            return;
                        }

                        state.machine[machineToUpdate] = {
                            ...state.machine[machineToUpdate],
                            ...settings,
                        };
                    }),
                    false,
                    'updateMachine'
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

                        if (!val) {
                            state.resetState();
                        }
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
