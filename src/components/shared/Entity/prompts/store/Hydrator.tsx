import type { BaseComponentProps } from 'types';

import { useEffect } from 'react';

import { usePreSavePromptStore } from 'components/shared/Entity/prompts/store/usePreSavePromptStore';
import { PROMPT_SETTINGS } from 'settings/prompts';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';

function PromptsHydrator({ children }: BaseComponentProps) {
    const [initializeSteps, resetState] = usePreSavePromptStore((state) => [
        state.initializeSteps,
        state.resetState,
    ]);

    const backfillDataflow = useBindingStore((state) => state.backfillDataFlow);
    const backfillCount = useBinding_backfilledBindings_count();

    useEffect(() => {
        initializeSteps(
            PROMPT_SETTINGS[
                Boolean(backfillDataflow && backfillCount)
                    ? 'dataFlowReset'
                    : 'defaultSave'
            ]
        );

        return () => {
            resetState();
        };
    }, [backfillCount, backfillDataflow, initializeSteps, resetState]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default PromptsHydrator;
