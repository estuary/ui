import { BaseComponentProps } from 'types';
import { useEffect, useRef } from 'react';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { usePreSavePromptStore } from './usePreSavePromptStore';

function PromptsHydrator({ children }: BaseComponentProps) {
    const initialized = useRef(false);

    const [initializeSteps] = usePreSavePromptStore((state) => [
        state.initializeSteps,
    ]);

    const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);
    const needsBackfilled = useBinding_backfilledBindings_count();

    useEffect(() => {
        if (initialized.current) {
            console.log('skipping hydration - this will probably break');
            return;
        }

        initializeSteps(Boolean(backfillDataflow && needsBackfilled));
        initialized.current = true;
    }, [backfillDataflow, initializeSteps, needsBackfilled]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default PromptsHydrator;
