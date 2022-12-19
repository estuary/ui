import { Box, Collapse, Typography } from '@mui/material';
import CollectionConfig from 'components/collection/Config';
import ConnectorTiles from 'components/ConnectorTiles';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import ExistingEntityCard from 'components/shared/Entity/ExistingEntityCards/ExistingEntityCard';
import useUnsavedChangesPrompt from 'components/shared/Entity/hooks/useUnsavedChangesPrompt';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecSwrMetadata } from 'hooks/useDraftSpecs';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useDetailsForm_changed,
    useDetailsForm_connectorImage,
    useDetailsForm_entityNameChanged,
} from 'stores/DetailsForm';
import {
    useEndpointConfigStore_changed,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
} from 'stores/FormState/hooks';
import { useResourceConfig_serverUpdateRequired } from 'stores/ResourceConfig/hooks';
import { EntityWithCreateWorkflow } from 'types';
import { hasLength } from 'utils/misc-utils';
import AlertBox from '../AlertBox';

interface Props {
    title: string;
    entityType: EntityWithCreateWorkflow;
    draftSpecMetadata: Pick<
        DraftSpecSwrMetadata,
        'draftSpecs' | 'isValidating' | 'error'
    >;
    resetState: () => void;
    toolbar: ReactNode;
    errorSummary: ReactNode;
    RediscoverButton?: ReactNode;
}

function EntityCreate({
    title,
    entityType,
    draftSpecMetadata,
    resetState,
    errorSummary,
    toolbar,
    RediscoverButton,
}: Props) {
    useBrowserTitle(title);

    // Supabase stuff
    const { combinedGrants } = useCombinedGrantsExt({
        adminOnly: true,
    });

    // Check for properties being passed in
    const [connectorID] = useGlobalSearchParams([
        GlobalSearchParams.CONNECTOR_ID,
    ]);

    const [showConnectorTiles, setShowConnectorTiles] = useState<
        boolean | null
    >(null);

    const {
        connectorTags,
        error: connectorTagsError,
        isValidating,
    } = useConnectorWithTagDetail(entityType);

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();
    const detailsFormChanged = useDetailsForm_changed();

    const entityNameChanged = useDetailsForm_entityNameChanged();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    const persistedDraftId = useEditorStore_persistedDraftId();

    // Endpoint Config Store
    const endpointConfigChanged = useEndpointConfigStore_changed();
    const endpointConfigServerUpdateRequired =
        useEndpointConfig_serverUpdateRequired();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const logToken = useFormStateStore_logToken();

    const formSubmitError = useFormStateStore_error();

    // Resource Config Store
    const resourceConfigServerUpdateRequired =
        useResourceConfig_serverUpdateRequired();

    const { draftSpecs } = draftSpecMetadata;

    const taskDraftSpec = useMemo(
        () => draftSpecs.filter(({ spec_type }) => spec_type === entityType),
        [draftSpecs, entityType]
    );

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    useEffect(() => {
        if (typeof connectorID === 'string') {
            setShowConnectorTiles(false);
        } else {
            setShowConnectorTiles(true);
        }
    }, [connectorID]);

    useEffect(() => {
        const resetDraftIdFlag =
            entityNameChanged ||
            endpointConfigServerUpdateRequired ||
            resourceConfigServerUpdateRequired;

        setDraftId(resetDraftIdFlag ? null : persistedDraftId);
    }, [
        setDraftId,
        endpointConfigServerUpdateRequired,
        entityNameChanged,
        persistedDraftId,
        resourceConfigServerUpdateRequired,
    ]);

    const promptDataLoss = detailsFormChanged() || endpointConfigChanged();

    useUnsavedChangesPrompt(!exitWhenLogsClose && promptDataLoss, resetState);

    const displayResourceConfig =
        entityType === 'materialization'
            ? hasLength(imageTag.id)
            : hasLength(imageTag.id) && !entityNameChanged && persistedDraftId;

    if (showConnectorTiles === null) return null;
    return (
        <>
            <Box sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
                {errorSummary}
            </Box>

            <Collapse in={showConnectorTiles} unmountOnExit>
                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="entityCreate.instructions" />
                </Typography>

                <ConnectorTiles protocolPreset={entityType} replaceOnNavigate />
            </Collapse>

            <Collapse in={!showConnectorTiles} unmountOnExit>
                <Typography sx={{ mb: 2 }}>
                    Placeholder for some instructions.
                </Typography>

                <ExistingEntityCard entityType={entityType} />
            </Collapse>

            <Collapse in={!showConnectorTiles} unmountOnExit>
                {connectorTagsError ? (
                    <Error error={connectorTagsError} />
                ) : (
                    <>
                        {toolbar}

                        <Collapse in={formSubmitError !== null} unmountOnExit>
                            {formSubmitError ? (
                                <EntityError
                                    title={formSubmitError.title}
                                    error={formSubmitError.error}
                                    logToken={logToken}
                                    draftId={draftId}
                                />
                            ) : null}
                        </Collapse>

                        {!isValidating && connectorTags.length === 0 ? (
                            <AlertBox severity="warning">
                                <FormattedMessage
                                    id={`${messagePrefix}.missingConnectors`}
                                />
                            </AlertBox>
                        ) : connectorTags.length > 0 ? (
                            <ErrorBoundryWrapper>
                                <DetailsForm
                                    connectorTags={connectorTags}
                                    accessGrants={combinedGrants}
                                    entityType={entityType}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {imageTag.id ? (
                            <ErrorBoundryWrapper>
                                <EndpointConfig connectorImage={imageTag.id} />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {displayResourceConfig ? (
                            <ErrorBoundryWrapper>
                                <CollectionConfig
                                    draftSpecs={taskDraftSpec}
                                    RediscoverButton={RediscoverButton}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        <ErrorBoundryWrapper>
                            <CatalogEditor
                                messageId={`${messagePrefix}.finalReview.instructions`}
                            />
                        </ErrorBoundryWrapper>
                    </>
                )}
            </Collapse>
        </>
    );
}

export default EntityCreate;
