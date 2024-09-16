import { BaseComponentProps } from 'types';
import { useEffect } from 'react';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { usePreSavePromptStore } from './usePreSavePromptStore';

function PromptsHydrator({ children }: BaseComponentProps) {
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

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default PromptsHydrator;
