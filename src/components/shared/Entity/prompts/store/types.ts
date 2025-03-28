import type { DataFlowResetContext } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/types';
import type {
    PromptSettings,
    PromptStep,
    PromptStepState,
} from 'src/components/shared/Entity/prompts/types';

// TODO (typing) would like to auto generate the `context` type somehow
//  by combining multiple steps contexts
export interface PreSavePromptStore {
    steps: PromptStep[];

    context: DataFlowResetContext;
    updateContext: (setting: Partial<PreSavePromptStore['context']>) => void;

    retryStep: (step: number) => void;
    updateStep: (step: number, settings: Partial<PromptStepState>) => void;
    initializeSteps: (settings: PromptSettings) => void;
    initUUID: string | null;

    activeStep: number;
    setActiveStep: (val: PreSavePromptStore['activeStep']) => void;
    nextStep: (skipped?: boolean) => void;
    previousStep: () => void;

    resetState: () => void;
}
