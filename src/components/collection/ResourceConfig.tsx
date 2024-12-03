import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import Backfill from 'components/editor/Bindings/Backfill';
import BackfillSection from 'components/editor/Bindings/Backfill/SectionWrapper';
import FieldSelectionViewer from 'components/editor/Bindings/FieldSelection';
import OnIncompatibleSchemaChange from 'components/editor/Bindings/OnIncompatibleSchemaChange';
import TimeTravel from 'components/editor/Bindings/TimeTravel';
import { useEditorStore_queryResponse_draftedBindingIndex } from 'components/editor/Store/hooks';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
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
    const isEdit = useEntityWorkflow_Editing();

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

    const showBackfillButton =
        isEdit && draftedBindingIndex > -1 && !collectionDisabled;

    return (
        <>
            <Typography variant="h6" sx={{ mb: 2 }}>
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

            {showBackfillButton || entityType === 'materialization' ? (
                <BackfillSection>
                    {showBackfillButton ? (
                        <Backfill
                            bindingIndex={draftedBindingIndex}
                            description={
                                <FormattedMessage
                                    id={`workflows.collectionSelector.manualBackfill.message.${entityType}`}
                                />
                            }
                        />
                    ) : null}

                    {entityType === 'materialization' ? (
                        <ErrorBoundryWrapper>
                            <OnIncompatibleSchemaChange
                                bindingIndex={draftedBindingIndex}
                            />
                        </ErrorBoundryWrapper>
                    ) : null}
                </BackfillSection>
            ) : null}

            {entityType === 'materialization' && !collectionDisabled ? (
                <FieldSelectionViewer
                    bindingUUID={bindingUUID}
                    collectionName={collectionName}
                    refreshRequired={refreshRequired}
                />
            ) : null}

            {entityType === 'materialization' ? (
                <TimeTravel
                    bindingUUID={bindingUUID}
                    collectionName={collectionName}
                />
            ) : null}
        </>
    );
}

export default ResourceConfig;
