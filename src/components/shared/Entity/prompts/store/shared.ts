import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { PromptStepMessageIds, PromptStepState } from '../types';

export const defaultStepState: PromptStepState = {
    error: null,
    progress: ProgressStates.IDLE,
    skippable: false,
    started: false,
    valid: false,
};

export const defaultStepMessageIds: PromptStepMessageIds = {
    running: 'common.inProgress',
    skipped: 'common.skipped',
    success: 'common.success',
};
