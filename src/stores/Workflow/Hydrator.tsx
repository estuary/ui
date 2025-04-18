import type { WorkflowInitializerProps } from 'src/components/shared/Entity/types';

import { useEffectOnce } from 'react-use';

import Error from 'src/components/shared/Error';
import useExpressWorkflowAuth from 'src/hooks/useExpressWorkflowAuth';
import { logRocketConsole } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import BindingHydrator from 'src/stores/Binding/Hydrator';
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

    const hydrationError = useWorkflowStore((state) => state.hydrationError);
    const hydrated = useWorkflowStore((state) => state.hydrated);
    const setHydrated = useWorkflowStore((state) => state.setHydrated);
    const setActive = useWorkflowStore((state) => state.setActive);
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );

    useEffectOnce(() => {
        if (!hydrated) {
            setActive(true);

            if (expressWorkflow) {
                getExpressWorkflowAuth().then(
                    ({ customerId, prefix, redirectURL }) => {
                        hydrateState({ customerId, prefix, redirectURL });
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

    if (hydrationError) {
        return (
            <Error
                condensed
                error={{
                    ...BASE_ERROR,
                    message: hydrationError,
                }}
            />
        );
    }

    return <BindingHydrator>{children}</BindingHydrator>;
}

export default WorkflowHydrator;
