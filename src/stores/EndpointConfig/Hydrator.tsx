import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { useEffect, useState } from 'react';
import { logRocketConsole } from 'services/shared';
import { useConnectorStore } from 'stores/Connector/Store';
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

    const [runHydration, setRunHydration] = useState(true);

    const hydrated = useEndpointConfig_hydrated();
    const setHydrated = useEndpointConfig_setHydrated();
    const setHydrationErrorsExist = useEndpointConfig_setHydrationErrorsExist();
    const hydrateState = useEndpointConfig_hydrateState();
    const setActive = useEndpointConfig_setActive();

    const enpointSchema = useConnectorStore(
        (state) => state.tag?.endpoint_spec_schema
    );

    useEffect(() => {
        if (
            runHydration &&
            !hydrated &&
            enpointSchema &&
            (entityType === 'capture' || entityType === 'materialization')
        ) {
            setRunHydration(false);
            setActive(true);
            hydrateState(entityType, workflow, enpointSchema).then(
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
        enpointSchema,
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
