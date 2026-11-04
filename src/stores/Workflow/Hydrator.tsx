import type { ReactNode } from 'react';

import { useEffectOnce } from 'react-use';

import Error from 'src/components/shared/Error';
import { ConnectorTagProvider } from 'src/context/ConnectorTag';
import { BASE_ERROR } from 'src/services/supabase';
import BindingHydrator from 'src/stores/Binding/Hydrator';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { useWorkflowHydrator } from 'src/stores/Workflow/useWorkflowHydrator';

interface WorkflowHydratorProps {
    children?: ReactNode;
}

// This hydrator is here without a store so that we can start working on moving a lot of
//  these separate stores into a single "Workflow" store for Create and Edit.
function WorkflowHydratorInner({ children }: WorkflowHydratorProps) {
    const hydrateWorkflow = useWorkflowHydrator();

    const hydrationError = useWorkflowStore((state) => state.hydrationError);
    const hydrated = useWorkflowStore((state) => state.hydrated);
    const setActive = useWorkflowStore((state) => state.setActive);

    // TODO: Replace with useEffect and alter the logic in a fashion where
    //   `hydrateState` is called once. Simply using a ref is not sufficient.
    // (Q1 2026 Update) - With React 18 StrictMode we just need to rethink hydration overall
    useEffectOnce(() => {
        if (!hydrated) {
            setActive(true);
            hydrateWorkflow();
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

function WorkflowHydrator({ children }: WorkflowHydratorProps) {
    return (
        <ConnectorTagProvider>
            <WorkflowHydratorInner>{children}</WorkflowHydratorInner>
        </ConnectorTagProvider>
    );
}

export default WorkflowHydrator;
