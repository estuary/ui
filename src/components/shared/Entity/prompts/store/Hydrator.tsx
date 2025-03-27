import type { BaseComponentProps } from 'src/types';

import { useEffect } from 'react';

import { usePreSavePromptStore } from 'src/components/shared/Entity/prompts/store/usePreSavePromptStore';
import { useBinding_backfilledBindings_count } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';

function PromptsHydrator({ children }: BaseComponentProps) {
    const [initializeSteps, resetState] = usePreSavePromptStore((state) => [
        state.initializeSteps,
        state.resetState,
    ]);

    const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);
    const backfillCount = useBinding_backfilledBindings_count();

    useEffect(() => {
        initializeSteps(Boolean(backfillDataflow && backfillCount));

        return () => {
            resetState();
        };
    }, [backfillCount, backfillDataflow, initializeSteps, resetState]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default PromptsHydrator;
