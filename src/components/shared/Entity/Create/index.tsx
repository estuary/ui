import { Box, Collapse } from '@mui/material';
import CollectionConfig from 'components/collection/Config';
import DraftSpecEditorHydrator from 'components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import useUnsavedChangesPrompt from 'components/shared/Entity/hooks/useUnsavedChangesPrompt';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import useConnectorWithTagDetail from 'hooks/connectors/useConnectorWithTagDetail';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { DraftSpecSwrMetadata } from 'hooks/useDraftSpecs';
import { ReactNode, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBinding_serverUpdateRequired } from 'stores/Binding/hooks';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { useDetailsForm_entityNameChanged } from 'stores/DetailsForm/hooks';
import {
    useEndpointConfigStore_changed,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
} from 'stores/FormState/hooks';
import { EntityWithCreateWorkflow } from 'types';
import { hasLength } from 'utils/misc-utils';
import AlertBox from '../../AlertBox';
import ValidationErrorSummary from '../ValidationErrorSummary';
import { useFormHydrationChecker } from '../hooks/useFormHydrationChecker';

interface Props {
    entityType: EntityWithCreateWorkflow;
    draftSpecMetadata: Pick<
        DraftSpecSwrMetadata,
        'draftSpecs' | 'isValidating' | 'error'
    >;
    toolbar: ReactNode;
    RediscoverButton?: ReactNode;
}

function EntityCreate({
    entityType,
    draftSpecMetadata,
    toolbar,
    RediscoverButton,
}: Props) {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);

    const { resetState } = useEntityWorkflowHelpers();

    const {
        connectorTags,
        error: connectorTagsError,
        isValidating,
    } = useConnectorWithTagDetail(entityType);

    // Binding Store
    const bindingServerUpdateRequired = useBinding_serverUpdateRequired();

    // Details Form Store
    const imageTag = useDetailsFormStore(
        (state) => state.details.data.connectorImage
    );
    const entityName = useDetailsFormStore((state) => state.draftedEntityName);
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
        const resetDraftIdFlag =
            entityNameChanged ||
            endpointConfigServerUpdateRequired ||
            bindingServerUpdateRequired;

        setDraftId(resetDraftIdFlag ? null : persistedDraftId);
    }, [
        setDraftId,
        endpointConfigServerUpdateRequired,
        entityNameChanged,
        persistedDraftId,
        bindingServerUpdateRequired,
    ]);

    // TODO (defect): Trigger the prompt data loss modal if the resource config section changes.
    const promptDataLoss = endpointConfigChanged();
    useUnsavedChangesPrompt(!exitWhenLogsClose && promptDataLoss, resetState);

    const displayResourceConfig = useMemo(
        () =>
            entityType === 'materialization'
                ? hasLength(imageTag.connectorId)
                : hasLength(imageTag.connectorId) &&
                  imageTag.connectorId === connectorId &&
                  !entityNameChanged &&
                  persistedDraftId,
        [
            connectorId,
            entityType,
            entityNameChanged,
            imageTag.connectorId,
            persistedDraftId,
        ]
    );

    const storeHydrationComplete = useFormHydrationChecker();

    return connectorTagsError ? (
        <Error error={connectorTagsError} />
    ) : !storeHydrationComplete ? null : (
        <DraftSpecEditorHydrator
            entityType={entityType}
            entityName={entityName}
        >
            {toolbar}

            <Box sx={{ mb: 4 }}>
                <ValidationErrorSummary />
            </Box>

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
                        entityType={entityType}
                    />
                </ErrorBoundryWrapper>
            ) : null}

            {imageTag.connectorId ? (
                <ErrorBoundryWrapper>
                    <EndpointConfig
                        connectorImage={imageTag.id}
                        hideBorder={!displayResourceConfig}
                    />
                </ErrorBoundryWrapper>
            ) : null}

            {displayResourceConfig ? (
                <ErrorBoundryWrapper>
                    <CollectionConfig
                        draftSpecs={taskDraftSpec}
                        RediscoverButton={RediscoverButton}
                        hideBorder={!draftId}
                    />
                </ErrorBoundryWrapper>
            ) : null}

            <CatalogEditor
                messageId={`${messagePrefix}.finalReview.instructions`}
            />
        </DraftSpecEditorHydrator>
    );
}

export default EntityCreate;
