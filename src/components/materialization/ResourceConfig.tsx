import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/materialization/ResourceConfigForm';
import Error from 'components/shared/Error';
import useConnectorTag from 'hooks/useConnectorTag';
import { FormattedMessage } from 'react-intl';

interface Props {
    connectorImage: string;
    collectionName: string;
}

function NewMaterializationResourceConfig({
    connectorImage,
    collectionName,
}: Props) {
    const { connectorTag, error } = useConnectorTag(connectorImage);

    if (error) {
        return <Error error={error} />;
    } else if (connectorTag) {
        return (
            <Box sx={{ mb: 5 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
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

export default NewMaterializationResourceConfig;
