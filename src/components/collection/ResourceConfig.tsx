import { FormattedMessage } from 'react-intl';

import { Box, Typography } from '@mui/material';

import ResourceConfigForm from 'components/collection/ResourceConfigForm';

import { useResourceConfig_hydrated } from 'stores/ResourceConfig/hooks';

import { BindingsEditorConfigSkeleton } from './CollectionSkeletons';

interface Props {
    collectionName: string;
    readOnly?: boolean;
}

function ResourceConfig({ collectionName, readOnly = false }: Props) {
    const hydrated = useResourceConfig_hydrated();

    return (
        <>
            <Typography variant="h6" sx={{ mb: 2 }}>
                <FormattedMessage id="materializationCreate.resourceConfig.heading" />
            </Typography>

            <Box sx={{ width: '100%' }}>
                {hydrated ? (
                    <ResourceConfigForm
                        collectionName={collectionName}
                        readOnly={readOnly}
                    />
                ) : (
                    <BindingsEditorConfigSkeleton />
                )}
            </Box>
        </>
    );
}

export default ResourceConfig;
