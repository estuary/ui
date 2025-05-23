import type { EmotionJSX } from '@emotion/react/dist/declarations/src/jsx-namespace';
import type { PublicationJobStatus } from 'src/api/publications';
import type { ErrorDetails } from 'src/components/shared/Error/types';
import type { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import type { CustomEvents } from 'src/services/types';

export type SupportedPrompts = 'dataFlowReset' | 'defaultSave';

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

export interface PromptSettings {
    dialogMessageId: string;
    loggingEvent: CustomEvents;
    steps: PromptStep[];
}
