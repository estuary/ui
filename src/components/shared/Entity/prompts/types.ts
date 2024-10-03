import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import { PublicationJobStatus } from 'api/publications';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';

export interface PromptStepMessageIds {
    running: string;
    skipped: string;
    success: string;
}

export interface PromptStepState {
    // Both server and client side error
    error: any | null; // PostgrestError

    // Stores what the step is currently doing
    progress: ProgressStates;

    // If true we will display the step as skippable and then each component can handle that
    skippable: boolean;

    // Stores if we have ever tried _once_
    started: boolean;

    // Controls if the user can continue on from this step
    valid: boolean;

    // Shows under the label
    optionalLabel?: string;

    publicationStatus?: PublicationJobStatus;
}

// TODO (dataflow typing) should try to get typing working with the context
export interface PromptStep {
    StepComponent: () => EmotionJSX.Element;
    stepLabelMessageId: string;
    state: PromptStepState;
    // messageIds: PromptStepMessageIds;
}
