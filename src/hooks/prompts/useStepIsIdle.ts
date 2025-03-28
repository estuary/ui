import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { ProgressStates } from 'src/components/tables/RowActions/Shared/types';
import { useLoopIndex } from 'src/context/LoopIndex/useLoopIndex';
import { useShallow } from 'zustand/react/shallow';

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
