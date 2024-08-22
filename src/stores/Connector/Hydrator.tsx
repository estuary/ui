import useConnectorTag from 'hooks/connectors/useConnectorTag';
import { useEffect } from 'react';
import { useBinding_setResourceSchema } from 'stores/Binding/hooks';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useEnpointConfigStore } from 'stores/EndpointConfig/Store';
import { BaseComponentProps } from 'types';
import { useConnectorStore } from './Store';

function ConnectorHydrator({ children }: BaseComponentProps) {
    const imageTag = useDetailsFormStore(
        (state) => state.details.data.connectorImage
    );

    const setEndpointSchema = useEnpointConfigStore(
        (state) => state.setEndpointSchema
    );
    const setResourceSchema = useBinding_setResourceSchema();

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
            setHydrationError(error.message);
            setHydrationErrorsExist(true);
            setHydrated(true);
        }

        if (connectorTag) {
            setTag(connectorTag);
            setHydrated(true);
            setHydrationError(null);
            setHydrationErrorsExist(false);

            setEndpointSchema(connectorTag.endpoint_spec_schema);
            void setResourceSchema(connectorTag.resource_spec_schema);
        }

        return () => {
            resetState();
        };
    }, [
        connectorTag,
        error,
        hydrated,
        isValidating,
        resetState,
        setEndpointSchema,
        setHydrated,
        setHydrationError,
        setHydrationErrorsExist,
        setResourceSchema,
        setTag,
    ]);

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
}

export default ConnectorHydrator;
