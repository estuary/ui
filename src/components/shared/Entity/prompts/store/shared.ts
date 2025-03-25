import type { PromptStepState } from '../types';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';

export const defaultStepState: PromptStepState = {
    error: null,
    progress: ProgressStates.IDLE,
    valid: false,
};
