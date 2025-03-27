import type { PromptStep } from 'src/components/shared/Entity/prompts/types';

import WaitForShardToIdle from '.';

import { defaultStepState } from 'src/components/shared/Entity/prompts/store/shared';

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
