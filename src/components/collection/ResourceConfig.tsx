import { Box, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import { BindingsEditorConfigSkeleton } from 'src/components/collection/CollectionSkeletons';
import ResourceConfigForm from 'src/components/collection/ResourceConfigForm';
import AdvancedOptions from 'src/components/editor/Bindings/AdvancedOptions';
import Backfill from 'src/components/editor/Bindings/Backfill';
import FieldSelectionViewer from 'src/components/editor/Bindings/FieldSelection';
import { useEditorStore_queryResponse_draftedBindingIndex } from 'src/components/editor/Store/hooks';
import TrialOnlyPrefixAlert from 'src/components/materialization/TrialOnlyPrefixAlert';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'src/context/EntityContext';
import {
    useBinding_collectionMetadataProperty,
    useBinding_currentBindingIndex,
    useBinding_hydrated,
    useBinding_resourceConfigOfMetaBindingProperty,
} from 'src/stores/Binding/hooks';

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

    const trialCollection = useBinding_collectionMetadataProperty(
        collectionName,
        'trialStorage'
    );

    const collectionAdded = useBinding_collectionMetadataProperty(
        collectionName,
        'added'
    );

    return (
        <>
            {entityType === 'materialization' ? (
                <Box style={{ marginBottom: 16 }}>
                    <TrialOnlyPrefixAlert
                        messageId="workflows.error.oldBoundCollection.added"
                        triggered={Boolean(trialCollection && collectionAdded)}
                    />
                </Box>
            ) : null}

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

            {/*Materializations show this in the AdvancedOptions*/}
            {entityType === 'capture' ? (
                <Backfill
                    bindingIndex={draftedBindingIndex}
                    collection={collectionName}
                    collectionEnabled={!collectionDisabled}
                />
            ) : null}

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
                collectionEnabled={!collectionDisabled}
            />
        </>
    );
}

export default ResourceConfig;
