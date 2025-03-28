import { PromptStepState } from '../types';

import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';

export const defaultStepState: PromptStepState = {
    error: null,
    progress: ProgressStates.IDLE,
    valid: false,
};
