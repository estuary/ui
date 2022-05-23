import EndpointConfigForm from 'components/shared/Entity/EndpointConfigForm';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfigHeader';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import useConnectorTag from 'hooks/useConnectorTag';

interface Props {
    connectorImage: string;
}

function EndpointConfig({ connectorImage }: Props) {
    const { connectorTag, error } = useConnectorTag(connectorImage);

    if (error) {
        return <Error error={error} />;
    } else if (connectorTag) {
        return (
            <WrapperWithHeader
                header={
                    <EndpointConfigHeader
                        docsPath={connectorTag.documentation_url}
                    />
                }
            >
                <EndpointConfigForm
                    endpointSchema={connectorTag.endpoint_spec_schema}
                />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default EndpointConfig;
