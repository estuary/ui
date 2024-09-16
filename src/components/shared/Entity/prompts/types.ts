import { EmotionJSX } from '@emotion/react/types/jsx-namespace';

export interface PromptStepState {
    done: boolean;

    // Both server and client side error
    errors: any[] | null;

    // Shows if it is actively running
    running: boolean;

    // Store whatever you want in here
    settings?: any;

    // Stores if we have ever tried _once_
    started: boolean;

    // Controls if the user can continue on from this step
    valid: boolean;
}

export interface PromptStep {
    StepComponent: () => EmotionJSX.Element;
    state: PromptStepState;
}
