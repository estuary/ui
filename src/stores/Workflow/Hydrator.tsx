import DraftInitializer from 'components/shared/Entity/Edit/DraftInitializer';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import useExpressWorkflowAuth from 'hooks/useExpressWorkflowAuth';
import { Fragment } from 'react';
import { useEffectOnce } from 'react-use';
import { logRocketConsole } from 'services/shared';
import BindingHydrator from 'stores/Binding/Hydrator';
import { EndpointConfigHydrator } from 'stores/EndpointConfig/Hydrator';
import { useWorkflowStore } from './Store';
import { WorkflowHydratorProps } from './types';
import { useWorkflowHydrator } from './useWorkflowHydrator';

// This hydrator is here without a store so that we can start working on moving a lot of
//  these separate stores into a single "Workflow" store for Create and Edit.
function WorkflowHydrator({
    children,
    expressWorkflow,
}: WorkflowHydratorProps) {
    const isEdit = useEntityWorkflow_Editing();
    const InitializerComponent = isEdit ? DraftInitializer : Fragment;

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
        <InitializerComponent>
            <EndpointConfigHydrator>
                <BindingHydrator>{children}</BindingHydrator>
            </EndpointConfigHydrator>
        </InitializerComponent>
    );
}

export default WorkflowHydrator;
