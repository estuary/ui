import { Divider } from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import DraftErrors from 'src/components/shared/Entity/Error/DraftErrors';
import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';

function StepDraftErrors() {
    const stepIndex = useLoopIndex();
    const [stepPublishable, stepFailed, dataFlowResetDraftId] =
        usePreSavePromptStore(
            useShallow((state) => {
                const currentState = state.steps[stepIndex].state;

                return [
                    Boolean(currentState.publicationStatus),
                    currentState.progress === ProgressStates.FAILED,
                    state.context.dataFlowResetDraftId,
                ];
            })
        );

    if (stepPublishable && dataFlowResetDraftId) {
        return (
            <>
                <DraftErrors
                    draftId={dataFlowResetDraftId}
                    enablePolling={stepFailed}
                />
                <Divider />
            </>
        );
    }

    return null;
}

export default StepDraftErrors;
