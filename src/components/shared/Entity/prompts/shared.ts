import type { DataFlowResetContext } from './types';
import { CustomEvents } from 'services/types';
import { DEFAULT_FILTER } from 'services/shared';

export const getInitialDataFlowResetContext = (): DataFlowResetContext => ({
    backfillTarget: null,
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
