import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import { FormattedMessage } from 'react-intl';

interface Props {
    collectionName: string;
    readOnly?: boolean;
}

function ResourceConfig({ collectionName, readOnly = false }: Props) {
    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                <FormattedMessage id="materializationCreate.resourceConfig.heading" />
            </Typography>

            <Box sx={{ width: '100%' }}>
                <ResourceConfigForm
                    collectionName={collectionName}
                    readOnly={readOnly}
                />
            </Box>
        </Box>
    );
}

export default ResourceConfig;
