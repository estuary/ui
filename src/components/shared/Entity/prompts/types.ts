import { EmotionJSX } from '@emotion/react/types/jsx-namespace';

export interface PromptStepState {
    done: boolean;

    // Both server and client side error
    errors: any[] | null;
    running: boolean;

    // Store whatever you want in here
    settings?: any;

    // Controls if the user can continue on from this step
    valid: boolean;
}

export interface PromptStep {
    StepComponent: () => EmotionJSX.Element;
    state: PromptStepState;
}
