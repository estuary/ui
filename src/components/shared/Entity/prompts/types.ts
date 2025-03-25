import type { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import type { PublicationJobStatus } from 'api/publications';
import type { ErrorDetails } from 'components/shared/Error/types';
import type { ProgressStates } from 'components/tables/RowActions/Shared/types';
import type { CustomEvents } from 'services/types';

import type { UpdateMaterializationStepContext } from './steps/dataFlowReset/Publish/types';
import type { DisableCaptureStepContext } from './steps/dataFlowReset/DisableCapture/types';
import type { SelectMaterializationStepContext } from './steps/dataFlowReset/SelectMaterialization/types';
import type { WaitForShardToIdleStepContext } from './steps/dataFlowReset/WaitForShardToIdle/types';

export type SupportedPrompts = 'dataFlowReset' | 'defaultSave';

export interface DataFlowResetContext
    extends DisableCaptureStepContext,
        SelectMaterializationStepContext,
        UpdateMaterializationStepContext,
        WaitForShardToIdleStepContext {
    disableBack: boolean;
    disableClose: boolean;
    dialogMessageId: string;
    loggingEvent: CustomEvents;
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

export interface PromptMachineSettings {
    dialogMessageId: string;
    loggingEvent: CustomEvents;
    steps: PromptStep[];
}
