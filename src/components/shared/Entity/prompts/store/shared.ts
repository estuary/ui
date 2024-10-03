import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { PromptStepState } from '../types';

export const defaultStepState: PromptStepState = {
    error: null,
    progress: ProgressStates.IDLE,
    valid: false,
};
