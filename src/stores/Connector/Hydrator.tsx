import useConnectorTag from 'hooks/connectors/useConnectorTag';
import { useEffect } from 'react';

import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useEnpointConfigStore } from 'stores/EndpointConfig/Store';
import { BaseComponentProps } from 'types';
import { useConnectorStore } from './Store';

function ConnectorHydrator({ children }: BaseComponentProps) {
    const imageTag = useDetailsFormStore(
        (state) => state.details.data.connectorImage
    );

    const [setEndpointSchema, endpoint_setHydrationErrorsExist] =
        useEnpointConfigStore((state) => [
            state.setEndpointSchema,
            state.setHydrationErrorsExist,
        ]);

    const [
        resetState,
        hydrated,
        setTag,
        setHydrated,
        setHydrationErrorsExist,
        setHydrationError,
    ] = useConnectorStore((state) => [
        state.resetState,
        state.hydrated,
        state.setTag,
        state.setHydrated,
        state.setHydrationErrorsExist,
        state.setHydrationError,
    ]);

    // The useConnectorTag hook can accept a connector ID or a connector tag ID.
    const { connectorTag, error, isValidating } = useConnectorTag(
        imageTag.connectorId
    );

    useEffect(() => {
        if (isValidating || hydrated) {
            return;
        }

        if (error?.message) {
            setTag(null);

            setHydrationError(error.message);
            setHydrationErrorsExist(true);
            endpoint_setHydrationErrorsExist(true);
        }

        if (connectorTag) {
            setTag(connectorTag);

            setHydrationError(null);
            setHydrationErrorsExist(false);
            endpoint_setHydrationErrorsExist(false);

            setEndpointSchema(connectorTag.endpoint_spec_schema);
        }

        setHydrated(true);
        return () => {
            resetState();
        };
    }, [
        connectorTag,
        endpoint_setHydrationErrorsExist,
        error,
        hydrated,
        isValidating,
        resetState,
        setEndpointSchema,
        setHydrated,
        setHydrationError,
        setHydrationErrorsExist,
        setTag,
    ]);

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default ConnectorHydrator;
