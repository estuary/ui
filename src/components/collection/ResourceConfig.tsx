import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import {
    DetailsFormStoreNames,
    ResourceConfigStoreNames,
} from 'context/Zustand';
import { FormattedMessage } from 'react-intl';

interface Props {
    collectionName: string;
    resourceConfigStoreName: ResourceConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
}

function ResourceConfig({
    collectionName,
    resourceConfigStoreName,
    detailsFormStoreName,
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
                    detailsFormStoreName={detailsFormStoreName}
                />
            </Box>
        </Box>
    );
}

export default ResourceConfig;
