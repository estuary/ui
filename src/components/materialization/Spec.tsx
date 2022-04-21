import { Box, Divider, Paper, Typography } from '@mui/material';
import SpecForm from 'components/materialization/SpecForm';
import SpecFormHeader from 'components/materialization/SpecFormHeader';
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

function NewMaterializationSpec({ connectorImage }: Props) {
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
            <Box sx={{ mb: 5 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Connection Config
                </Typography>

                <Paper variant="outlined" sx={{ width: '100%' }}>
                    <SpecFormHeader
                        name={connector.data.connectors.image_name}
                        docsPath={connector.data.documentation_url}
                    />

                    <Divider />

                    <SpecForm
                        endpointSchema={connector.data.endpoint_spec_schema}
                    />
                </Paper>
            </Box>
        );
    } else {
        return null;
    }
}

export default NewMaterializationSpec;
