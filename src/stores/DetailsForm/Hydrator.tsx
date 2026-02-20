import type { BaseComponentProps } from 'src/types';

import { useEffectOnce } from 'react-use';

import { useShallow } from 'zustand/react/shallow';

import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow } from 'src/context/Workflow';
import { logRocketConsole } from 'src/services/shared';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';

// TODO: Remove details form store hydrator and hydrateState action.
//   It is only used by the test JSON forms page.
export const DetailsFormHydrator = ({ children }: BaseComponentProps) => {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const hydrated = useDetailsFormStore((state) => state.hydrated);
    const setHydrated = useDetailsFormStore((state) => state.setHydrated);
    const setActive = useDetailsFormStore((state) => state.setActive);
    const [setHydrationErrorsExist, dataPlaneOptions] = useDetailsFormStore(
        useShallow((state) => [state.setHydrationErrorsExist, state.dataPlaneOptions])
    );

    const hydrateState = useDetailsFormStore((state) => state.hydrateState);

    useEffectOnce(() => {
        if (
            !hydrated &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            setActive(true);
            hydrateState(workflow, dataPlaneOptions).then(
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
