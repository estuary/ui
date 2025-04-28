import type { ReactNode } from 'react';
import type { DraftSpecSwrMetadata } from 'src/hooks/useDraftSpecs';
import type { EntityWithCreateWorkflow } from 'src/types';

import { useEffect, useMemo } from 'react';

import { Box, Collapse } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import CollectionConfig from 'src/components/collection/Config';
import DraftSpecEditorHydrator from 'src/components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import CatalogEditor from 'src/components/shared/Entity/CatalogEditor';
import DetailsForm from 'src/components/shared/Entity/DetailsForm';
import EndpointConfig from 'src/components/shared/Entity/EndpointConfig';
import EntityError from 'src/components/shared/Entity/Error';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useFormHydrationChecker } from 'src/components/shared/Entity/hooks/useFormHydrationChecker';
import useUnsavedChangesPrompt from 'src/components/shared/Entity/hooks/useUnsavedChangesPrompt';
import ValidationErrorSummary from 'src/components/shared/Entity/ValidationErrorSummary';
import Error from 'src/components/shared/Error';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import useConnectorWithTagDetail from 'src/hooks/connectors/useConnectorWithTagDetail';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { BASE_ERROR } from 'src/services/supabase';
import { useBinding_serverUpdateRequired } from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_changed,
} from 'src/stores/EndpointConfig/hooks';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
} from 'src/stores/FormState/hooks';
import { hasLength } from 'src/utils/misc-utils';

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
    const detailsHydrationError = useDetailsFormStore(
        (state) => state.hydrationError
    );
    const imageTag = useDetailsFormStore(
        (state) => state.details.data.connectorImage
    );
    const entityName = useDetailsFormStore((state) => state.draftedEntityName);
    const entityNameChanged = useDetailsFormStore(
        (state) => state.entityNameChanged
    );

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
    useUnsavedChangesPrompt(
        !exitWhenLogsClose && endpointConfigChanged,
        resetState
    );

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

    return connectorTagsError || detailsHydrationError ? (
        <Error
            condensed
            error={
                connectorTagsError ?? {
                    ...BASE_ERROR,
                    message: detailsHydrationError,
                }
            }
        />
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
                <AlertBox short={false} severity="warning">
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
