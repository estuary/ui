import type { DisableCaptureStepContext } from 'components/shared/Entity/prompts/steps/dataFlowReset/DisableCapture/types';
import type { PublishStepContext } from 'components/shared/Entity/prompts/steps/dataFlowReset/Publish/types';
import type { SelectMaterializationStepContext } from 'components/shared/Entity/prompts/steps/dataFlowReset/SelectMaterialization/types';
import type { UpdateMaterializationStepContext } from 'components/shared/Entity/prompts/steps/dataFlowReset/UpdateMaterialization/types';
import type { WaitForShardToIdleStepContext } from 'components/shared/Entity/prompts/steps/dataFlowReset/WaitForShardToIdle/types';
import type { CustomEvents } from 'services/types';

export interface DataFlowResetContext
    extends DisableCaptureStepContext,
        SelectMaterializationStepContext,
        UpdateMaterializationStepContext,
        PublishStepContext,
        WaitForShardToIdleStepContext {
    disableBack: boolean;
    disableClose: boolean;
    dialogMessageId: string;
    loggingEvent: CustomEvents;
}
