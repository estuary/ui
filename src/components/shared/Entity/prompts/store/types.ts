import { DataFlowResetContext } from '../steps/dataFlowReset/shared';
import { PromptStep, PromptStepState } from '../types';

// TODO (typing) would like to auto generate the `context` type somehow
//  by combining multiple steps contexts
export interface PreSavePromptStore {
    steps: PromptStep[];

    context: DataFlowResetContext;
    updateContext: (setting: any) => void;

    updateStep: (step: number, settings: Partial<PromptStepState>) => void;
    initializeSteps: (backfillEnabled: boolean) => void;
    initUUID: string | null;

    activeStep: number;
    setActiveStep: (val: PreSavePromptStore['activeStep']) => void;
    nextStep: (force?: boolean) => void;
    previousStep: () => void;

    resetState: () => void;
}
