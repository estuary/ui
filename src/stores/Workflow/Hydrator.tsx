import type { WorkflowInitializerProps } from 'src/components/shared/Entity/types';

import { useEffectOnce } from 'react-use';

import Error from 'src/components/shared/Error';
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
    const { hydrateState } = useWorkflowHydrator(expressWorkflow);

    const hydrationError = useWorkflowStore((state) => state.hydrationError);
    const hydrated = useWorkflowStore((state) => state.hydrated);
    const setActive = useWorkflowStore((state) => state.setActive);

    // TODO: Replace with useEffect and alter the logic in a fashion where
    //   `hydrateState` is called once. Simply using a ref is not sufficient.
    // (Q1 2026 Update) - With React 18 StrictMode we just need to rethink hydration overall
    useEffectOnce(() => {
        if (!hydrated) {
            setActive(true);
            hydrateState();
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
