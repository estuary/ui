import { Divider, Paper, Typography } from '@mui/material';
import EndpointConfigHeader from 'components/materialization/EndpointConfigHeader';
import Error from 'components/shared/Error';
import EndpointConfigForm from 'components/shared/foo/EndpointConfigForm';
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
            <>
                <Typography variant="h5">Connection Config</Typography>
                <Paper sx={{ width: '100%' }} variant="outlined">
                    <EndpointConfigHeader
                        name={connector.data.connectors.image_name}
                        docsPath={connector.data.documentation_url}
                    />
                    <Divider />
                    <EndpointConfigForm
                        endpointSchema={connector.data.endpoint_spec_schema}
                    />
                </Paper>
            </>
        );
    } else {
        return null;
    }
}

export default EndpointConfig;
