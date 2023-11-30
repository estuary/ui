import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import FieldSelectionViewer from 'components/editor/Bindings/FieldSelection';
import { useEntityType } from 'context/EntityContext';
import { FormattedMessage } from 'react-intl';
import {
    useResourceConfig_hydrated,
    useResourceConfig_resourceConfigOfCollectionProperty,
} from 'stores/ResourceConfig/hooks';
import TimeTravel from 'components/editor/Bindings/TimeTravel';
import BackgroundDryRun from 'components/shared/Entity/Edit/BackgroundDryRun';
import { BindingsEditorConfigSkeleton } from './CollectionSkeletons';

interface Props {
    collectionName: string;
    readOnly?: boolean;
}

function ResourceConfig({ collectionName, readOnly = false }: Props) {
    const entityType = useEntityType();

    const hydrated = useResourceConfig_hydrated();

    // If the collection is disabled then it will not come back in the built spec
    //  binding list. This means the user could end up clicking "See Fields" button
    //  forever and never get fields listed.
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
                <BackgroundDryRun>
                    <FieldSelectionViewer collectionName={collectionName} />
                </BackgroundDryRun>
            ) : null}

            {entityType === 'materialization' ? (
                <TimeTravel collectionName={collectionName} />
            ) : null}
        </>
    );
}

export default ResourceConfig;
