import { BaseComponentProps } from 'types';
import { useEffectOnce } from 'react-use';

import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';

import { logRocketConsole } from 'services/logrocket';

import {
    useEndpointConfig_hydrated,
    useEndpointConfig_hydrateState,
    useEndpointConfig_setHydrated,
    useEndpointConfig_setHydrationErrorsExist,
} from 'stores/EndpointConfig/hooks';

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

                    logRocketConsole(
                        'Failed to hydrate endpoint config',
                        error
                    );
                }
            );
        }
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
