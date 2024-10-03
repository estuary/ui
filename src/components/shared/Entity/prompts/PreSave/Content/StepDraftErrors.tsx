import { Divider } from '@mui/material';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import DraftErrors from 'components/shared/Entity/Error/DraftErrors';
import { useShallow } from 'zustand/react/shallow';
import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';

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
