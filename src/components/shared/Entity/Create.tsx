import { Alert, Collapse, Typography } from '@mui/material';
import CollectionConfig from 'components/collection/Config';
import ConnectorTiles from 'components/ConnectorTiles';
import {
    useEditorStore_id,
    useEditorStore_setId,
} from 'components/editor/Store';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import useUnsavedChangesPrompt from 'components/shared/Entity/hooks/useUnsavedChangesPrompt';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useConnectorTag from 'hooks/useConnectorTag';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm';
import { useEndpointConfigStore_setEndpointSchema } from 'stores/EndpointConfig';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
} from 'stores/FormState';
import { EntityWithCreateWorkflow, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    title: string;
    connectorType: EntityWithCreateWorkflow;
    Header: any;
    showCollections?: boolean;
    promptDataLoss: any;
    resetState: () => void;
}

function EntityCreate({
    title,
    connectorType,
    Header,
    showCollections,
    promptDataLoss,
    resetState,
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

    // const specId = useGlobalSearchParams(GlobalSearchParams.LIVE_SPEC_ID, true);

    const [showConnectorTiles, setShowConnectorTiles] = useState<
        boolean | null
    >(null);

    const {
        connectorTags,
        error: connectorTagsError,
        isValidating,
    } = useConnectorWithTagDetail(connectorType);

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    // Endpoint Config Store
    const setEndpointSchema = useEndpointConfigStore_setEndpointSchema();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const logToken = useFormStateStore_logToken();

    const formSubmitError = useFormStateStore_error();

    // Resource Config Store
    // TODO: Determine proper placement for this logic.
    // const prefillEmptyCollections = useResourceConfig_preFillEmptyCollections();

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const { connectorTag } = useConnectorTag(imageTag.id);
    // const { liveSpecs } = useLiveSpecsExtWithOutSpec(specId, ENTITY.CAPTURE);
    // const { liveSpecs: liveSpecsByLastPub } = useLiveSpecsExtByLastPubId(
    //     lastPubId,
    //     ENTITY.CAPTURE
    // );

    useEffect(() => {
        if (connectorTag?.endpoint_spec_schema) {
            // TODO: Repair temporary typing.
            setEndpointSchema(
                connectorTag.endpoint_spec_schema as unknown as Schema
            );

            // We wanna make sure we do these after the schemas are set as
            //  as they are dependent on them.
            // if (liveSpecs.length > 0) {
            //     prefillEmptyCollections(liveSpecs);
            // } else if (liveSpecsByLastPub.length > 0) {
            //     prefillEmptyCollections(liveSpecsByLastPub);
            // }
        }
    }, [
        setEndpointSchema,
        connectorTag?.endpoint_spec_schema,
        // liveSpecs,
        // liveSpecsByLastPub,
        // prefillEmptyCollections,
    ]);

    useEffect(() => {
        if (typeof connectorID === 'string') {
            setShowConnectorTiles(false);
        } else {
            setShowConnectorTiles(true);
        }
    }, [connectorID]);

    useUnsavedChangesPrompt(!exitWhenLogsClose && promptDataLoss, resetState);

    if (showConnectorTiles === null) return null;
    return (
        <>
            {Header}

            <Collapse in={showConnectorTiles} unmountOnExit>
                <Typography sx={{ mb: 2 }}>
                    <FormattedMessage id="entityCreate.instructions" />
                </Typography>

                <ConnectorTiles
                    protocolPreset={connectorType}
                    replaceOnNavigate
                />
            </Collapse>

            <Collapse in={!showConnectorTiles} unmountOnExit>
                {connectorTagsError ? (
                    <Error error={connectorTagsError} />
                ) : (
                    <>
                        <Collapse in={formSubmitError !== null}>
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
                            <Alert severity="warning">
                                <FormattedMessage
                                    id={`${messagePrefix}.missingConnectors`}
                                />
                            </Alert>
                        ) : connectorTags.length > 0 ? (
                            <ErrorBoundryWrapper>
                                <DetailsForm
                                    connectorTags={connectorTags}
                                    accessGrants={combinedGrants}
                                    entityType={connectorType}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {imageTag.id ? (
                            <ErrorBoundryWrapper>
                                <EndpointConfig connectorImage={imageTag.id} />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {showCollections && hasLength(imageTag.id) ? (
                            <ErrorBoundryWrapper>
                                <CollectionConfig />
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
