import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { PostgrestError } from '@supabase/postgrest-js';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';

export interface PromptStepState {
    // Both server and client side error
    error: PostgrestError | null;

    // Stores what the step is currently doing
    progress: ProgressStates;

    // Stores if we have ever tried _once_
    started: boolean;

    // Controls if the user can continue on from this step
    valid: boolean;

    // Used to show logging
    logsToken?: string;
}

export interface StepComponentProps {
    stepIndex: number;
}

export interface PromptStep<T = any> {
    StepComponent: (props: StepComponentProps) => EmotionJSX.Element;
    stepLabelMessageId: string;
    state: PromptStepState;
    context: T;
}
