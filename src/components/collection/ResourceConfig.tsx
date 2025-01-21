import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import AdvancedOptions from 'components/editor/Bindings/AdvancedOptions';
import Backfill from 'components/editor/Bindings/Backfill';
import FieldSelectionViewer from 'components/editor/Bindings/FieldSelection';
import { useEditorStore_queryResponse_draftedBindingIndex } from 'components/editor/Store/hooks';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'context/EntityContext';
import { FormattedMessage } from 'react-intl';
import {
    useBinding_currentBindingIndex,
    useBinding_hydrated,
    useBinding_resourceConfigOfMetaBindingProperty,
} from 'stores/Binding/hooks';
import { BindingsEditorConfigSkeleton } from './CollectionSkeletons';

interface Props {
    bindingUUID: string;
    collectionName: string;
    refreshRequired: boolean;
    readOnly?: boolean;
}

function ResourceConfig({
    bindingUUID,
    collectionName,
    refreshRequired,
    readOnly = false,
}: Props) {
    const entityType = useEntityType();

    const hydrated = useBinding_hydrated();
    const stagedBindingIndex = useBinding_currentBindingIndex();

    const draftedBindingIndex =
        useEditorStore_queryResponse_draftedBindingIndex(
            collectionName,
            stagedBindingIndex
        );

    // If the collection is disabled then it will not come back in the built spec
    //  binding list. This means the user could end up clicking "See Fields" button
    //  forever and never get fields listed.
    const collectionDisabled = useBinding_resourceConfigOfMetaBindingProperty(
        bindingUUID,
        'disable'
    );

    return (
        <>
            <Typography
                component="div"
                sx={{ mb: 2 }}
                variant="formSectionHeader"
            >
                <FormattedMessage id="materializationCreate.resourceConfig.heading" />
            </Typography>

            <Box sx={{ width: '100%' }}>
                {hydrated ? (
                    <ErrorBoundryWrapper>
                        <ResourceConfigForm
                            bindingUUID={bindingUUID}
                            collectionName={collectionName}
                            readOnly={readOnly}
                        />
                    </ErrorBoundryWrapper>
                ) : (
                    <BindingsEditorConfigSkeleton />
                )}
            </Box>

            <Backfill
                bindingIndex={draftedBindingIndex}
                collectionEnabled={!collectionDisabled}
            />

            {entityType === 'materialization' && !collectionDisabled ? (
                <FieldSelectionViewer
                    bindingUUID={bindingUUID}
                    collectionName={collectionName}
                    refreshRequired={refreshRequired}
                />
            ) : null}

            <AdvancedOptions
                bindingIndex={draftedBindingIndex}
                bindingUUID={bindingUUID}
                collectionName={collectionName}
            />
        </>
    );
}

export default ResourceConfig;
