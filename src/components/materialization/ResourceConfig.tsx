import { Box, Paper, Typography } from '@mui/material';
import ResourceConfigForm from 'components/materialization/ResourceConfigForm';
import Error from 'components/shared/Error';
import { useQuery, useSelectSingle } from 'hooks/supabase-swr';
import { TABLES } from 'services/supabase';

interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    id: string;
    resource_spec_schema: string;
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
    resource_spec_schema, 
    documentation_url
`;

function NewMaterializationResourceConfig({ connectorImage }: Props) {
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
                    Resource Config
                </Typography>

                <Paper variant="outlined" sx={{ width: '100%' }}>
                    <ResourceConfigForm
                        resourceSchema={connector.data.resource_spec_schema}
                    />
                </Paper>
            </Box>
        );
    } else {
        return null;
    }
}

export default NewMaterializationResourceConfig;
