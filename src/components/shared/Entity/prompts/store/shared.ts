import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { PromptStepState } from '../types';

export const defaultStepState: PromptStepState = {
    errors: null,
    progress: ProgressStates.IDLE,
    started: false,
    valid: false,
};
