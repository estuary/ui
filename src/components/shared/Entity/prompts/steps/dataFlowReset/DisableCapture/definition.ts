import { defaultStepState } from '../../../store/shared';
import { PromptStep } from '../../../types';
import DisableCapture from '.';

export const DisableCaptureStep: PromptStep<{
    logsToken: string | null;
}> = {
    StepComponent: DisableCapture,
    stepLabelMessageId: 'dataFlowReset.disableCapture.title',
    state: defaultStepState,
    context: {
        logsToken: null,
    },
};
