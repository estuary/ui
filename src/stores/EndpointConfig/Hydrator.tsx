import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';

import { useEffect, useRef } from 'react';
import { logRocketConsole } from 'services/shared';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import {
    useEndpointConfig_hydrateState,
    useEndpointConfig_hydrated,
    useEndpointConfig_setActive,
    useEndpointConfig_setHydrated,
    useEndpointConfig_setHydrationErrorsExist,
} from 'stores/EndpointConfig/hooks';
import { BaseComponentProps } from 'types';

export const EndpointConfigHydrator = ({ children }: BaseComponentProps) => {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();

    const runHydration = useRef(true);

    const connectorTagId = useDetailsFormStore(
        (state) => state.details.data.connectorImage.id
    );

    const hydrated = useEndpointConfig_hydrated();
    const setHydrated = useEndpointConfig_setHydrated();
    const setHydrationErrorsExist = useEndpointConfig_setHydrationErrorsExist();
    const hydrateState = useEndpointConfig_hydrateState();
    const setActive = useEndpointConfig_setActive();

    logRocketConsole('EndpointConfigHydrator', {
        runHydration: Boolean(runHydration.current),
        hydrated,
        connectorTagId,
        entityType,
    });

    useEffect(() => {
        if (
            runHydration.current &&
            !hydrated &&
            connectorTagId.length > 0 &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            runHydration.current = false;
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
        setActive,
        setHydrated,
        setHydrationErrorsExist,
        workflow,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
