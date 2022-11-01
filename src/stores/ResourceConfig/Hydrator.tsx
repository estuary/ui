import { useEntityWorkflow } from 'context/Workflow';
import { ReactNode } from 'react';
import { useEffectOnce } from 'react-use';
import {
    useResourceConfig_hydrated,
    useResourceConfig_hydrateState,
    useResourceConfig_setHydrated,
    useResourceConfig_setHydrationErrorsExist,
} from './hooks';

interface ResourceConfigHydratorProps {
    children: ReactNode;
}

export default function ResourceConfigHydrator({
    children,
}: ResourceConfigHydratorProps) {
    const workflow = useEntityWorkflow();

    const hydrated = useResourceConfig_hydrated();
    const setHydrated = useResourceConfig_setHydrated();

    const setHydrationErrorsExist = useResourceConfig_setHydrationErrorsExist();

    const hydrateState = useResourceConfig_hydrateState();

    useEffectOnce(() => {
        if (workflow && !hydrated) {
            hydrateState(workflow).then(
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
}
