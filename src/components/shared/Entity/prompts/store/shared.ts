import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import type { PromptStepState } from 'src/components/shared/Entity/prompts/types';


export const defaultStepState: PromptStepState = {
    error: null,
    progress: ProgressStates.IDLE,
    valid: false,
};
