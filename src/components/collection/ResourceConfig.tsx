import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import FieldSelectionViewer from 'components/editor/Bindings/FieldSelection';
import { useEntityType } from 'context/EntityContext';
import { FormattedMessage } from 'react-intl';
import {
    useResourceConfig_hydrated,
    useResourceConfig_resourceConfigOfCollectionProperty,
} from 'stores/ResourceConfig/hooks';
import { BindingsEditorConfigSkeleton } from './CollectionSkeletons';

interface Props {
    collectionName: string;
    readOnly?: boolean;
}

function ResourceConfig({ collectionName, readOnly = false }: Props) {
    const entityType = useEntityType();

    const hydrated = useResourceConfig_hydrated();

    const collectionDisabled =
        useResourceConfig_resourceConfigOfCollectionProperty(
            collectionName,
            'disable'
        );

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

            {entityType === 'materialization' && !collectionDisabled ? (
                <FieldSelectionViewer collectionName={collectionName} />
            ) : null}
        </>
    );
}

export default ResourceConfig;
