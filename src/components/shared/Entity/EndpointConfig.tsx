import EndpointConfigForm from 'components/shared/Entity/EndpointConfigForm';
import EndpointConfigHeader from 'components/shared/Entity/EndpointConfigHeader';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import Error from 'components/shared/Error';
import { useQuery, useSelectSingle } from 'hooks/supabase-swr';
import { TABLES } from 'services/supabase';

interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    id: string;
    endpoint_spec_schema: string;
    documentation_url: string;
}

interface Props {
    connectorImage: string;
}
const CONNECTOR_TAGS_QUERY = `
    connectors(
        image_name
    ),
    id,
    endpoint_spec_schema, 
    documentation_url
`;

function EndpointConfig({ connectorImage }: Props) {
    const tagsQuery = useQuery<ConnectorTag>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_TAGS_QUERY,
            filter: (query) => query.eq('id', connectorImage),
            count: 'exact',
        },
        [connectorImage]
    );
    const { data: connector, error } = useSelectSingle(tagsQuery);

    if (error) {
        return <Error error={error} />;
    } else if (connector?.data) {
        return (
            <WrapperWithHeader
                header={
                    <EndpointConfigHeader
                        docsPath={connector.data.documentation_url}
                    />
                }
            >
                <EndpointConfigForm
                    endpointSchema={connector.data.endpoint_spec_schema}
                />
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default EndpointConfig;
