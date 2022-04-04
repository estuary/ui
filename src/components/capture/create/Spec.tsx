import { Divider, Paper } from '@mui/material';
import NewCaptureSpecForm from 'components/capture/create/SpecForm';
import NewCaptureSpecFormHeader from 'components/capture/create/SpecFormHeader';
import Error from 'components/shared/Error';
import { Tables } from 'services/supabase';
import { useQuery, useSelectSingle } from 'supabase-swr';

interface ConnectorTag {
    connectors: {
        image_name: string;
    };
    id: string;
    endpoint_spec_schema: string;
    documentation_url: string;
}

function NewCaptureSpec(props: {
    connectorImage: string;
    displayValidation: boolean;
    readonly: boolean;
}) {
    const { connectorImage, readonly, displayValidation } = props;

    const tagsQuery = useQuery<ConnectorTag>(
        Tables.CONNECTOR_TAGS,
        {
            columns: `
                connectors(
                    image_name
                ),
                id,
                endpoint_spec_schema, 
                documentation_url
            `,
            filter: (query) => query.eq('id', connectorImage),
            count: 'exact',
        },
        []
    );
    const { data: connector, error } = useSelectSingle(tagsQuery, {});

    if (error) {
        return <Error error={error} />;
    } else if (connector?.data) {
        return (
            <Paper sx={{ width: '100%' }} variant="outlined">
                <NewCaptureSpecFormHeader
                    name={connector.data.connectors.image_name}
                    docsPath={connector.data.documentation_url}
                />
                <Divider />
                <NewCaptureSpecForm
                    endpointSchema={connector.data.endpoint_spec_schema}
                    displayValidation={displayValidation}
                    readonly={readonly}
                />
            </Paper>
        );
    } else {
        return null;
    }
}

export default NewCaptureSpec;
