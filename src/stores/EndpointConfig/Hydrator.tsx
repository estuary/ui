import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import LogRocket from 'logrocket';
import { useEffectOnce } from 'react-use';
import {
    useEndpointConfig_hydrated,
    useEndpointConfig_hydrateState,
    useEndpointConfig_setHydrated,
    useEndpointConfig_setHydrationErrorsExist,
} from 'stores/EndpointConfig/hooks';
import { BaseComponentProps } from 'types';

export const EndpointConfigHydrator = ({ children }: BaseComponentProps) => {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const hydrated = useEndpointConfig_hydrated();
    const setHydrated = useEndpointConfig_setHydrated();
    const setHydrationErrorsExist = useEndpointConfig_setHydrationErrorsExist();
    const hydrateState = useEndpointConfig_hydrateState();

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

                    LogRocket.log('Failed to hydrate endpoint config', error);
                }
            );
        }
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
