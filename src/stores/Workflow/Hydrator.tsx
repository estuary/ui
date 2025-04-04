import type { WorkflowInitializerProps } from 'src/components/shared/Entity/types';

import { useEffectOnce } from 'react-use';

import useExpressWorkflowAuth from 'src/hooks/useExpressWorkflowAuth';
import { logRocketConsole } from 'src/services/shared';
import BindingHydrator from 'src/stores/Binding/Hydrator';
import { EndpointConfigHydrator } from 'src/stores/EndpointConfig/Hydrator';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { useWorkflowHydrator } from 'src/stores/Workflow/useWorkflowHydrator';

// This hydrator is here without a store so that we can start working on moving a lot of
//  these separate stores into a single "Workflow" store for Create and Edit.
function WorkflowHydrator({
    children,
    expressWorkflow,
}: WorkflowInitializerProps) {
    const { getExpressWorkflowAuth } = useExpressWorkflowAuth();
    const { hydrateState } = useWorkflowHydrator();

    const hydrated = useWorkflowStore((state) => state.hydrated);
    const setHydrated = useWorkflowStore((state) => state.setHydrated);
    const setActive = useWorkflowStore((state) => state.setActive);
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );
    const setCustomerId = useWorkflowStore((state) => state.setCustomerId);
    const setRedirectUrl = useWorkflowStore((state) => state.setRedirectUrl);

    useEffectOnce(() => {
        if (!hydrated) {
            setActive(true);

            if (expressWorkflow) {
                getExpressWorkflowAuth().then(
                    ({ customerId, prefix, redirectURL }) => {
                        setCustomerId(customerId);
                        setRedirectUrl(redirectURL);

                        hydrateState({ customerId, prefix });
                    },
                    (error) => {
                        setHydrated(true);
                        setHydrationErrorsExist(true);

                        logRocketConsole('Failed to hydrate workflow', error);
                    }
                );
            } else {
                hydrateState();
            }
        }
    });

    if (!hydrated) {
        return null;
    }

    return (
        <EndpointConfigHydrator>
            <BindingHydrator>{children}</BindingHydrator>
        </EndpointConfigHydrator>
    );
}

export default WorkflowHydrator;
