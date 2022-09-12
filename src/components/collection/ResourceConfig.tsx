import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import { ResourceConfigStoreNames } from 'context/Zustand';
import { FormattedMessage } from 'react-intl';

interface Props {
    collectionName: string;
    resourceConfigStoreName: ResourceConfigStoreNames;
    readOnly?: boolean;
}

function ResourceConfig({
    collectionName,
    resourceConfigStoreName,
    readOnly = false,
}: Props) {
    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                <FormattedMessage id="materializationCreate.resourceConfig.heading" />
            </Typography>

            <Box sx={{ width: '100%' }}>
                <ResourceConfigForm
                    collectionName={collectionName}
                    resourceConfigStoreName={resourceConfigStoreName}
                    readOnly={readOnly}
                />
            </Box>
        </Box>
    );
}

export default ResourceConfig;
