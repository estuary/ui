import { CustomEvents } from 'services/types';
import { DataFlowSteps, PreSaveSteps } from './steps/stepDefinitions';
import type { PromptMachineSettings, SupportedPrompts } from './types';

// !!!!!!!!!ORDER IS IMPORTANT!!!!!!!!!!!!
// `steps` property is run through in order.
export const PROMPT_SETTINGS: {
    [key in SupportedPrompts]: PromptMachineSettings;
} = {
    dataFlowReset: {
        dialogMessageId: 'resetDataFlow.dialog.title',
        loggingEvent: CustomEvents.DATA_FLOW_RESET,
        steps: [
            DataFlowSteps.selectMaterialization,
            PreSaveSteps.reviewSelection,
            DataFlowSteps.disableCapture,
            DataFlowSteps.waitForShardToIdle,
            DataFlowSteps.updateMaterialization,
            DataFlowSteps.enableCapture,
            DataFlowSteps.publishStep,
        ],
    },
    defaultSave: {
        dialogMessageId: 'preSavePrompt.dialog.title',
        loggingEvent: CustomEvents.ENTITY_SAVE,
        steps: [PreSaveSteps.reviewSelection, PreSaveSteps.publishStep],
    },
};
