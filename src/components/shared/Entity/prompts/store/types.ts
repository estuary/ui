import type { CustomEvents } from 'services/types';
import type { DataFlowResetContext, SAVE_PROMPT_SETTINGS } from '../shared';
import type { PromptStep, PromptStepState } from '../types';

export interface PreSavePromptInitSettings {
    dialogMessageId: string;
    loggingEvent: CustomEvents;
    steps: PromptStep[];
}

// TODO (typing) would like to auto generate the `context` type somehow
//  by combining multiple steps contexts
export interface PreSavePromptStore {
    steps: PromptStep[];

    context: DataFlowResetContext;
    updateContext: (setting: Partial<PreSavePromptStore['context']>) => void;

    retryStep: (step: number) => void;
    updateStep: (step: number, settings: Partial<PromptStepState>) => void;
    initializeSteps: (settings: keyof typeof SAVE_PROMPT_SETTINGS) => void;
    initUUID: string | null;

    activeStep: number;
    setActiveStep: (val: PreSavePromptStore['activeStep']) => void;
    nextStep: (skipped?: boolean) => void;
    previousStep: () => void;

    resetState: () => void;
}
