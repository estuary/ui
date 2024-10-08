import { BaseComponentProps } from 'types';
import { useEffect } from 'react';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { usePreSavePromptStore } from './usePreSavePromptStore';

function PromptsHydrator({ children }: BaseComponentProps) {
    const [initializeSteps] = usePreSavePromptStore((state) => [
        state.initializeSteps,
    ]);

    const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);
    const backfillCount = useBinding_backfilledBindings_count();

    useEffect(() => {
        initializeSteps(Boolean(backfillDataflow && backfillCount));
    }, [backfillDataflow, initializeSteps, backfillCount]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default PromptsHydrator;
