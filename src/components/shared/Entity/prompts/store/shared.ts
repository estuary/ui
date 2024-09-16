import { PromptStepState } from '../types';

export const defaultStepState: PromptStepState = {
    done: false,
    errors: null,
    running: false,
    valid: true,
};
