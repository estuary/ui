import type {
    PromptSettings,
    SupportedPrompts,
} from 'src/components/shared/Entity/prompts/types';

import {
    DataFlowResetSteps,
    PreSaveSteps,
} from 'src/components/shared/Entity/prompts/steps/definitions';
import { CustomEvents } from 'src/services/types';

// !!!!!!!!!ORDER IS IMPORTANT!!!!!!!!!!!!
//  `steps` property is looped through in order
// !!!!!!!!!ORDER IS IMPORTANT!!!!!!!!!!!!
export const PROMPT_SETTINGS: {
    [key in SupportedPrompts]: PromptSettings;
} = {
    dataFlowReset: {
        dialogMessageId: 'resetDataFlow.dialog.title',
        loggingEvent: CustomEvents.DATA_FLOW_RESET,
        steps: [
            DataFlowResetSteps.selectMaterialization,
            PreSaveSteps.reviewSelection,
            DataFlowResetSteps.disableCapture,
            DataFlowResetSteps.waitForShardToIdle,
            DataFlowResetSteps.updateMaterialization,
            DataFlowResetSteps.enableCapture,
            DataFlowResetSteps.publishStep,
        ],
    },
    defaultSave: {
        dialogMessageId: 'preSavePrompt.dialog.title',
        loggingEvent: CustomEvents.ENTITY_SAVE,
        steps: [PreSaveSteps.reviewSelection, PreSaveSteps.publishStep],
    },
};
