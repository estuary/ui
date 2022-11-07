import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { ReactNode } from 'react';
import { useEffectOnce } from 'react-use';
import {
    useResourceConfig_hydrated,
    useResourceConfig_hydrateState,
    useResourceConfig_setHydrated,
    useResourceConfig_setHydrationErrorsExist,
} from './hooks';

// Hydrator
interface ResourceConfigHydratorProps {
    children: ReactNode;
}

export const ResourceConfigHydrator = ({
    children,
}: ResourceConfigHydratorProps) => {
    const entityType = useEntityType();

    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'materialization_edit' || workflow === 'capture_edit';

    const hydrated = useResourceConfig_hydrated();
    const setHydrated = useResourceConfig_setHydrated();

    const setHydrationErrorsExist = useResourceConfig_setHydrationErrorsExist();

    const hydrateState = useResourceConfig_hydrateState();

    useEffectOnce(() => {
        if (workflow && !hydrated) {
            hydrateState(editWorkflow, entityType).then(
                () => {
                    setHydrated(true);
                },
                () => {
                    setHydrated(true);
                    setHydrationErrorsExist(true);
                }
            );
        }
    });

    return <div>{children}</div>;
};

export default ResourceConfigHydrator;
