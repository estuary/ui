import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { useEffect, useState } from 'react';
import { logRocketConsole } from 'services/shared';
import { useDetailsForm_connectorImage_id } from 'stores/DetailsForm/hooks';
import {
    useEndpointConfig_hydrated,
    useEndpointConfig_hydrateState,
    useEndpointConfig_setActive,
    useEndpointConfig_setHydrated,
    useEndpointConfig_setHydrationErrorsExist,
} from 'stores/EndpointConfig/hooks';
import { BaseComponentProps } from 'types';

export const EndpointConfigHydrator = ({ children }: BaseComponentProps) => {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const [runHydration, setRunHydration] = useState(true);

    const connectorTagId = useDetailsForm_connectorImage_id();

    const hydrated = useEndpointConfig_hydrated();
    const setHydrated = useEndpointConfig_setHydrated();
    const setHydrationErrorsExist = useEndpointConfig_setHydrationErrorsExist();
    const hydrateState = useEndpointConfig_hydrateState();
    const setActive = useEndpointConfig_setActive();

    useEffect(() => {
        if (
            runHydration &&
            !hydrated &&
            connectorTagId.length > 0 &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            console.log('hydrating');
            setRunHydration(false);
            setActive(true);
            hydrateState(entityType, workflow, connectorTagId).then(
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
    }, [
        connectorTagId,
        entityType,
        hydrateState,
        hydrated,
        runHydration,
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        workflow,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
