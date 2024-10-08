import { ProgressStates } from 'components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'context/LoopIndex/useLoopIndex';
import { useShallow } from 'zustand/react/shallow';
import { usePreSavePromptStore } from '../store/usePreSavePromptStore';

function useStepIsIdle() {
    const stepIndex = useLoopIndex();
    return usePreSavePromptStore(
        useShallow(
            (state) =>
                state.steps[stepIndex]?.state?.progress === ProgressStates.IDLE
        )
    );
}

export default useStepIsIdle;
