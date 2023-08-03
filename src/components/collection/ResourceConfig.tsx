import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import FieldSelectionViewer from 'components/editor/Bindings/FieldSelection';
import { useEntityType } from 'context/EntityContext';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useResourceConfig_hydrated } from 'stores/ResourceConfig/hooks';
import { BindingsEditorConfigSkeleton } from './CollectionSkeletons';

interface Props {
    collectionName: string;
    readOnly?: boolean;
}

// TODO: (field selection): This is a way to "hide" the field selection view from a user
//  but allow us to test the feature out in prod. Remove when the feature is launched.
const hiddenSearchParam = 'please_show';

function ResourceConfig({ collectionName, readOnly = false }: Props) {
    const entityType = useEntityType();

    const hydrated = useResourceConfig_hydrated();

    const fieldSelectionFlag = useGlobalSearchParams(
        GlobalSearchParams.HIDDEN_FIELD_SELECTION
    );
    const showFieldSelection = useMemo(
        () => fieldSelectionFlag === hiddenSearchParam,
        [fieldSelectionFlag]
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

            {showFieldSelection && entityType === 'materialization' ? (
                <FieldSelectionViewer
                    collectionName={collectionName}
                    connectorsExist={true}
                />
            ) : null}
        </>
    );
}

export default ResourceConfig;
