import { useCallback } from 'react';


import { logRocketConsole } from 'src/services/shared';
import { useDetailsFormHydrator } from 'src/stores/DetailsForm/useDetailsFormHydrator';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { useEndpointConfigHydrator } from 'src/stores/EndpointConfig/useEndpointConfigHydrator';

export const useWorkflowHydrator = () => {
    const { hydrateDetailsForm } = useDetailsFormHydrator();
    const { hydrateEndpointConfig } = useEndpointConfigHydrator();

    const setHydrated = useWorkflowStore((state) => state.setHydrated);
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );

    const hydrateWorkflow = useCallback(
        async (metadata?: { customerId: string; prefix: string }) => {
            const baseEntityName = metadata
                ? `${metadata.prefix}${metadata.customerId}`
                : undefined;

            try {
                const { connectorTagId } =
                    await hydrateDetailsForm(baseEntityName);

                await hydrateEndpointConfig(connectorTagId);
            } catch (error: unknown) {
                return Promise.reject(error);
            }

            return Promise.resolve();
        },
        [hydrateDetailsForm, hydrateEndpointConfig]
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
