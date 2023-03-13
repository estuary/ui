import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import LogRocket from 'logrocket';
import { useEffectOnce } from 'react-use';
import {
    useDetailsForm_hydrated,
    useDetailsForm_hydrateState,
    useDetailsForm_setHydrated,
    useDetailsForm_setHydrationErrorsExist,
} from 'stores/DetailsForm/hooks';
import { BaseComponentProps } from 'types';

export const DetailsFormHydrator = ({ children }: BaseComponentProps) => {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const hydrated = useDetailsForm_hydrated();
    const setHydrated = useDetailsForm_setHydrated();

    const setHydrationErrorsExist = useDetailsForm_setHydrationErrorsExist();

    const hydrateState = useDetailsForm_hydrateState();

    useEffectOnce(() => {
        if (
            !hydrated &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            hydrateState(entityType, workflow).then(
                () => {
                    setHydrated(true);
                },
                (error) => {
                    setHydrated(true);
                    setHydrationErrorsExist(true);

                    LogRocket.log('Failed to hydrate details form', error);
                }
            );
        }
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
