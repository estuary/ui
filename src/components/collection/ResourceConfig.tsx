import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import Error from 'components/shared/Error';
import useConnectorTag from 'hooks/useConnectorTag';
import { FormattedMessage } from 'react-intl';

interface Props {
    connectorImage: string;
    collectionName: string;
}

function ResourceConfig({ connectorImage, collectionName }: Props) {
    const { connectorTag, error } = useConnectorTag(connectorImage);

    if (error) {
        return <Error error={error} />;
    } else if (connectorTag) {
        return (
            <Box sx={{ p: 1 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {collectionName}{' '}
                    <FormattedMessage id="materializationCreate.resourceConfig.heading" />
                </Typography>

                <Box sx={{ width: '100%' }}>
                    <ResourceConfigForm
                        resourceSchema={connectorTag.resource_spec_schema}
                        collectionName={collectionName}
                    />
                </Box>
            </Box>
        );
    } else {
        return null;
    }
}

export default ResourceConfig;
