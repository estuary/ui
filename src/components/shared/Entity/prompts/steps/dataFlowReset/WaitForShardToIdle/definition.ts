import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import WaitForShardToIdle from '.';

export interface WaitForShardToIdleStepContext {
    timeStopped: string | null;
}

export const WaitForShardToIdleStep: PromptStep = {
    StepComponent: WaitForShardToIdle,
    stepLabelMessageId: 'resetDataFlow.waitForShardToIdle.title',
    state: {
        ...defaultStepState,
        allowRetry: true,
    },
};
