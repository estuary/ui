import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow } from 'context/Workflow';
import { isEmpty } from 'lodash';
import LogRocket from 'logrocket';
import { useEffect } from 'react';
import { useEffectOnce } from 'react-use';
import {
    useEndpointConfigStore_endpointSchema,
    useEndpointConfig_hydrated,
    useEndpointConfig_hydrateState,
    useEndpointConfig_setHydrated,
    useEndpointConfig_setHydrationErrorsExist,
    useEndpointConfig_setServerUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import { BaseComponentProps } from 'types';

export const EndpointConfigHydrator = ({ children }: BaseComponentProps) => {
    const entityType = useEntityType();
    const workflow = useEntityWorkflow();
    const endpointSchema = useEndpointConfigStore_endpointSchema();

    console.log('endpointSchema', { endpointSchema });

    const hydrated = useEndpointConfig_hydrated();
    const setHydrated = useEndpointConfig_setHydrated();

    const setHydrationErrorsExist = useEndpointConfig_setHydrationErrorsExist();

    const hydrateState = useEndpointConfig_hydrateState();

    const setServerUpdateRequired = useEndpointConfig_setServerUpdateRequired();

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

    useEffect(() => {
        const hasFields = Boolean(
            endpointSchema.properties && !isEmpty(endpointSchema.properties)
        );

        console.log('setServerUpdateRequired effect', { hasFields });
        setServerUpdateRequired(hasFields);
    }, [endpointSchema.properties, setServerUpdateRequired]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
