import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { useEffectOnce } from 'react-use';
import { logRocketConsole } from 'services/logrocket';
import {
    useDetailsForm_hydrated,
    useDetailsForm_hydrateState,
    useDetailsForm_setActive,
    useDetailsForm_setHydrated,
    useDetailsForm_setHydrationErrorsExist,
} from 'stores/DetailsForm/hooks';
import { BaseComponentProps } from 'types';

export const DetailsFormHydrator = ({ children }: BaseComponentProps) => {
    console.log('DetailsFormHydrator');
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const hydrated = useDetailsForm_hydrated();
    const setHydrated = useDetailsForm_setHydrated();
    const setActive = useDetailsForm_setActive();
    const setHydrationErrorsExist = useDetailsForm_setHydrationErrorsExist();

    const hydrateState = useDetailsForm_hydrateState();

    useEffectOnce(() => {
        if (
            !hydrated &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            setActive(true);
            hydrateState(entityType, workflow).then(
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

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
