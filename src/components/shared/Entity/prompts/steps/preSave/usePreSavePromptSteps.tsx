import { useEffect } from 'react';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { usePreSavePromptStore } from '../../store/usePreSavePromptStore';

function usePreSavePromptSteps() {
    const [resetState, initializeSteps] = usePreSavePromptStore((state) => [
        state.resetState,
        state.initializeSteps,
    ]);

    const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);
    const needsBackfilled = useBinding_backfilledBindings_count();

    useEffect(() => {
        initializeSteps(Boolean(backfillDataflow && needsBackfilled));

        return () => {
            resetState();
        };
    }, [backfillDataflow, initializeSteps, needsBackfilled, resetState]);
}

export default usePreSavePromptSteps;
