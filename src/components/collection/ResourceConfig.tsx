import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import { FormattedMessage } from 'react-intl';

interface Props {
    collectionName: string;
}

function ResourceConfig({ collectionName }: Props) {
    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                <FormattedMessage id="materializationCreate.resourceConfig.heading" />
            </Typography>

            <Box sx={{ width: '100%' }}>
                <ResourceConfigForm collectionName={collectionName} />
            </Box>
        </Box>
    );
}

export default ResourceConfig;
