import { PromptStep, PromptStepState } from '../types';

// TODO (typing) would like to auto generate the `context` type somehow
//  by combining multiple steps contexts
export interface PreSavePromptStore<T = any> {
    steps: PromptStep[];

    context: T;
    updateContext: (setting: any) => void;

    updateStep: (step: number, settings: Partial<PromptStepState>) => void;
    initializeSteps: (backfillEnabled: boolean) => void;

    activeStep: number;
    setActiveStep: (val: PreSavePromptStore['activeStep']) => void;
    nextStep: () => void;
    previousStep: () => void;

    show: boolean;
    setShow: (data: PreSavePromptStore['show']) => void;

    resetState: () => void;
}
