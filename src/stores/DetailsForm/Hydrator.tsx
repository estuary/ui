import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';

import { useEffectOnce } from 'react-use';
import { logRocketConsole } from 'services/shared';
import type { BaseComponentProps } from 'types';
import { useDetailsFormStore } from './Store';

export const DetailsFormHydrator = ({ children }: BaseComponentProps) => {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const hydrated = useDetailsFormStore((state) => state.hydrated);
    const setHydrated = useDetailsFormStore((state) => state.setHydrated);
    const setActive = useDetailsFormStore((state) => state.setActive);
    const setHydrationErrorsExist = useDetailsFormStore(
        (state) => state.setHydrationErrorsExist
    );

    const hydrateState = useDetailsFormStore((state) => state.hydrateState);

    useEffectOnce(() => {
        if (
            !hydrated &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            setActive(true);
            hydrateState(workflow).then(
                () => {
                    setHydrated(true);
                },
                (error) => {
                    setHydrated(true);
                    setHydrationErrorsExist(true);

                    logRocketConsole('Failed to hydrate details form', error);
                }
            );
        }
    });

    // Until details is hydrated we should wait to load in the other hydrator children
    if (!hydrated) {
        return null;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
