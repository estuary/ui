import type { DataFlowResetContext } from 'src/components/shared/Entity/prompts/steps/dataFlowReset/types';
import { DEFAULT_FILTER } from 'src/services/shared';

import { CustomEvents } from 'src/services/types';

export const getInitialDataFlowResetContext = (): DataFlowResetContext => ({
    backfillTarget: null,
    backfilledDraftId: null,
    captureName: DEFAULT_FILTER,
    captureSpec: null,
    dataFlowResetDraftId: null,
    dataFlowResetPudId: null,
    dialogMessageId: 'preSavePrompt.dialog.title',
    disableBack: false,
    disableClose: false,
    initialPubId: null,
    loggingEvent: CustomEvents.ENTITY_SAVE,
    noMaterializations: null,
    relatedMaterializations: null,
    targetHasOverlap: null,
    timeStopped: null,
});
