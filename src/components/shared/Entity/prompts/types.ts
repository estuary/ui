import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { PublicationJobStatus } from 'api/publications';
import { ErrorDetails } from 'components/shared/Error/types';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';

export interface PromptStepMessageIds {
    running: string;
    skipped: string;
    success: string;
}

export interface PromptStepState {
    error: ErrorDetails | null; // Both server and client side error
    progress: ProgressStates; // Stores what the step is currently doing
    valid: boolean; // Controls if the user can continue on from this step
    allowRetry?: boolean; // Control if the step will show a `Retry` button on the error.
    optionalLabel?: string; // Shows under the label
    publicationStatus?: PublicationJobStatus;
}

// TODO (dataflow typing) should try to get typing working with the context
export interface PromptStep {
    StepComponent: () => EmotionJSX.Element;
    stepLabelMessageId: string;
    state: PromptStepState;
}
