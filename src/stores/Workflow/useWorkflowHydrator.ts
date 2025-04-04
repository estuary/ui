import { useCallback } from 'react';

import { logRocketConsole } from 'src/services/shared';
import { useDetailsFormHydrator } from 'src/stores/DetailsForm/useDetailsFormHydrator';
import { useWorkflowStore } from 'src/stores/Workflow/Store';

export const useWorkflowHydrator = () => {
    const { hydrateDetailsForm } = useDetailsFormHydrator();

    const setHydrated = useWorkflowStore((state) => state.setHydrated);
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );

    const hydrateWorkflow = useCallback(
        async (metadata?: { customerId: string; prefix: string }) => {
            const baseEntityName = metadata
                ? `${metadata.prefix}${metadata.customerId}`
                : undefined;

            await hydrateDetailsForm(baseEntityName);
        },
        [hydrateDetailsForm]
    );

    return {
        hydrateState: (metadata?: { customerId: string; prefix: string }) =>
            hydrateWorkflow(metadata).then(
                () => {
                    setHydrated(true);
                },
                (error) => {
                    setHydrated(true);
                    setHydrationErrorsExist(true);

                    logRocketConsole('Failed to hydrate workflow', error);
                }
            ),
    };
};
