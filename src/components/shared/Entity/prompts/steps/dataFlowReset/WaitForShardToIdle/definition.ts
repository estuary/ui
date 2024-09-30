import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import WaitForShardToIdle from '.';

export interface WaitForShardToIdleStepContext {
    liveSpecId: string | null;
    timeStopped: string | null;
}

export const WaitForShardToIdleStep: PromptStep = {
    StepComponent: WaitForShardToIdle,
    stepLabelMessageId: 'dataFlowReset.waitForShardToIdle.title',
    state: {
        ...defaultStepState,
    },
    // messageIds: defaultStepMessageIds,
};
