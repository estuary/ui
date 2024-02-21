import { Box, Typography } from '@mui/material';
import ResourceConfigForm from 'components/collection/ResourceConfigForm';
import Backfill from 'components/editor/Bindings/Backfill';
import FieldSelectionViewer from 'components/editor/Bindings/FieldSelection';
import TimeTravel from 'components/editor/Bindings/TimeTravel';
import { useEditorStore_queryResponse_draftedBindingIndex } from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import { FormattedMessage } from 'react-intl';
import { useBinding_resourceConfigOfMetaCollectionProperty } from 'stores/Binding/hooks';
import { useResourceConfig_hydrated } from 'stores/ResourceConfig/hooks';
import { BindingsEditorConfigSkeleton } from './CollectionSkeletons';

interface Props {
    bindingId: string;
    collectionName: string;
    readOnly?: boolean;
}

function ResourceConfig({
    bindingId,
    collectionName,
    readOnly = false,
}: Props) {
    const entityType = useEntityType();
    const isEdit = useEntityWorkflow_Editing();

    const hydrated = useResourceConfig_hydrated();

    const draftedBindingIndex =
        useEditorStore_queryResponse_draftedBindingIndex(collectionName);

    // If the collection is disabled then it will not come back in the built spec
    //  binding list. This means the user could end up clicking "See Fields" button
    //  forever and never get fields listed.
    const collectionDisabled =
        useBinding_resourceConfigOfMetaCollectionProperty(bindingId, 'disable');

    return (
        <>
            <Typography variant="h6" sx={{ mb: 2 }}>
                <FormattedMessage id="materializationCreate.resourceConfig.heading" />
            </Typography>

            <Box sx={{ width: '100%' }}>
                {hydrated ? (
                    <ResourceConfigForm
                        bindingId={bindingId}
                        collectionName={collectionName}
                        readOnly={readOnly}
                    />
                ) : (
                    <BindingsEditorConfigSkeleton />
                )}
            </Box>

            {isEdit && draftedBindingIndex > -1 && !collectionDisabled ? (
                <Backfill
                    bindingIndex={draftedBindingIndex}
                    description={
                        <FormattedMessage
                            id={`workflows.collectionSelector.manualBackfill.message.${entityType}`}
                        />
                    }
                />
            ) : null}

            {entityType === 'materialization' && !collectionDisabled ? (
                <FieldSelectionViewer collectionName={collectionName} />
            ) : null}

            {entityType === 'materialization' ? (
                <TimeTravel collectionName={collectionName} />
            ) : null}
        </>
    );
}

export default ResourceConfig;
