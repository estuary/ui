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
import {
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useConnectorTag from 'hooks/useConnectorTag';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import {
    useLiveSpecsExtByLastPubId,
    useLiveSpecsExtWithOutSpec,
} from 'hooks/useLiveSpecsExt';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDetailsForm_connectorImage } from 'stores/DetailsForm';
import { useEndpointConfigStore_setEndpointSchema } from 'stores/EndpointConfig';
import {
    EntityFormState,
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
} from 'stores/FormState';
import { ResourceConfigState } from 'stores/ResourceConfig';
import { ENTITY, EntityWithCreateWorkflow, Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

interface Props {
    title: string;
    connectorType: EntityWithCreateWorkflow;
    Header: any;
    formStateStoreName: FormStateStoreNames;
    resourceConfigStoreName?: ResourceConfigStoreNames;
    showCollections?: boolean;
    promptDataLoss: any;
    resetState: () => void;
}

function EntityCreate({
    title,
    connectorType,
    Header,
    formStateStoreName,
    resourceConfigStoreName,
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
    const [connectorID, lastPubId] = useGlobalSearchParams([
        GlobalSearchParams.CONNECTOR_ID,
        GlobalSearchParams.LAST_PUB_ID,
    ]);

    const specId = useGlobalSearchParams(GlobalSearchParams.LIVE_SPEC_ID, true);

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
    const messagePrefix = useZustandStore<
        EntityFormState,
        EntityFormState['messagePrefix']
    >(formStateStoreName, (state) => state.messagePrefix);

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const logToken = useFormStateStore_logToken();

    const formSubmitError = useFormStateStore_error();

    // Resource Config Store
    // TODO: Determine proper placement for this logic.
    const setResourceSchema = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['setResourceSchema']
    >(
        resourceConfigStoreName ?? ResourceConfigStoreNames.MATERIALIZATION,
        (state) => state.setResourceSchema
    );

    const prefillEmptyCollections = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['preFillEmptyCollections']
    >(
        resourceConfigStoreName ?? ResourceConfigStoreNames.MATERIALIZATION,
        (state) => state.preFillEmptyCollections
    );

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const { connectorTag } = useConnectorTag(imageTag.id);
    const { liveSpecs } = useLiveSpecsExtWithOutSpec(specId, ENTITY.CAPTURE);
    const { liveSpecs: liveSpecsByLastPub } = useLiveSpecsExtByLastPubId(
        lastPubId,
        ENTITY.CAPTURE
    );

    useEffect(() => {
        if (connectorTag) {
            // TODO: Repair temporary typing.
            setEndpointSchema(
                connectorTag.endpoint_spec_schema as unknown as Schema
            );

            setResourceSchema(
                connectorTag.resource_spec_schema as unknown as Schema
            );

            // We wanna make sure we do these after the schemas are set as
            //  as they are dependent on them.
            if (liveSpecs.length > 0) {
                prefillEmptyCollections(liveSpecs);
            } else if (liveSpecsByLastPub.length > 0) {
                prefillEmptyCollections(liveSpecsByLastPub);
            }
        }
    }, [
        connectorTag,
        liveSpecs,
        liveSpecsByLastPub,
        prefillEmptyCollections,
        setEndpointSchema,
        setResourceSchema,
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
                                    formStateStoreName={formStateStoreName}
                                    entityType={connectorType}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {imageTag.id ? (
                            <ErrorBoundryWrapper>
                                <EndpointConfig
                                    connectorImage={imageTag.id}
                                    formStateStoreName={formStateStoreName}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {showCollections &&
                        resourceConfigStoreName &&
                        hasLength(imageTag.id) ? (
                            <ErrorBoundryWrapper>
                                <CollectionConfig
                                    resourceConfigStoreName={
                                        resourceConfigStoreName
                                    }
                                    formStateStoreName={formStateStoreName}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        <ErrorBoundryWrapper>
                            <CatalogEditor
                                messageId={`${messagePrefix}.finalReview.instructions`}
                                formStateStoreName={formStateStoreName}
                            />
                        </ErrorBoundryWrapper>
                    </>
                )}
            </Collapse>
        </>
    );
}

export default EntityCreate;
