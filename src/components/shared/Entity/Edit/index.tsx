import { Box, Collapse } from '@mui/material';
import CollectionConfig from 'components/collection/Config';
import DraftSpecEditorHydrator from 'components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_draftInitializationError,
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
import useBrowserTitle from 'hooks/useBrowserTitle';
import { DraftSpecSwrMetadata } from 'hooks/useDraftSpecs';
import { ReactNode, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { logRocketEvent } from 'services/shared';
import { BASE_ERROR } from 'services/supabase';
import { CustomEvents } from 'services/types';
import { useBinding_serverUpdateRequired } from 'stores/Binding/hooks';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
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
import { useFormHydrationChecker } from '../hooks/useFormHydrationChecker';
import IncompatibleCollections from '../IncompatibleCollections';
import PreSavePrompt from '../prompts/PreSave';
import PromptsHydrator from '../prompts/store/Hydrator';
import ValidationErrorSummary from '../ValidationErrorSummary';

interface Props {
    title: string;
    entityType: EntityWithCreateWorkflow;
    readOnly: {
        detailsForm?: true;
        endpointConfigForm?: true;
        resourceConfigForm?: true;
    };
    draftSpecMetadata: Pick<
        DraftSpecSwrMetadata,
        'draftSpecs' | 'isValidating' | 'error'
    >;
    toolbar: ReactNode;
    RediscoverButton?: ReactNode;
}

// eslint-disable-next-line complexity
function EntityEdit({
    title,
    entityType,
    readOnly,
    draftSpecMetadata,
    toolbar,
    RediscoverButton,
}: Props) {
    useBrowserTitle(title);

    const intl = useIntl();

    const { resetState } = useEntityWorkflowHelpers();

    const {
        connectorTags,
        error: connectorTagsError,
        isValidating,
    } = useConnectorWithTagDetail(entityType);

    // Binding Store
    const resourceConfigServerUpdateRequired =
        useBinding_serverUpdateRequired();

    // Details Form Store
    const detailsHydrationError = useDetailsFormStore(
        (state) => state.hydrationError
    );
    const imageTag = useDetailsFormStore(
        (state) => state.details.data.connectorImage
    );
    const entityName = useDetailsFormStore((state) => state.draftedEntityName);

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    const persistedDraftId = useEditorStore_persistedDraftId();

    const draftInitializationError = useEditorStore_draftInitializationError();

    // Endpoint Config Store
    const endpointConfigChanged = useEndpointConfigStore_changed();
    const endpointConfigServerUpdateRequired =
        useEndpointConfig_serverUpdateRequired();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const logToken = useFormStateStore_logToken();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const formSubmitError = useFormStateStore_error();

    const { draftSpecs } = draftSpecMetadata;

    const taskDraftSpec = useMemo(
        () => draftSpecs.filter(({ spec_type }) => spec_type === entityType),
        [draftSpecs, entityType]
    );

    useEffect(() => {
        const resetDraftIdFlag =
            endpointConfigServerUpdateRequired ||
            resourceConfigServerUpdateRequired;

        const newValue = resetDraftIdFlag ? null : persistedDraftId;

        logRocketEvent(CustomEvents.DRAFT_ID_SET, {
            newValue,
            component: 'EntityEdit',
        });

        setDraftId(newValue);
    }, [
        setDraftId,
        endpointConfigServerUpdateRequired,
        persistedDraftId,
        resourceConfigServerUpdateRequired,
    ]);

    // TODO (defect): Trigger the prompt data loss modal if the resource config section changes.
    useUnsavedChangesPrompt(
        !exitWhenLogsClose && endpointConfigChanged,
        resetState
    );

    const storeHydrationComplete = useFormHydrationChecker();

    return (
        <>
            {toolbar}

            <Box sx={{ mb: 4 }}>
                <ValidationErrorSummary />
            </Box>

            {connectorTagsError || detailsHydrationError ? (
                <Error
                    condensed
                    error={
                        connectorTagsError ?? {
                            ...BASE_ERROR,
                            message: detailsHydrationError,
                        }
                    }
                />
            ) : !persistedDraftId || !storeHydrationComplete ? null : (
                <DraftSpecEditorHydrator
                    entityType={entityType}
                    entityName={entityName}
                >
                    <PromptsHydrator>
                        <Collapse in={formSubmitError !== null}>
                            {formSubmitError ? (
                                <EntityError
                                    title={formSubmitError.title}
                                    error={formSubmitError.error}
                                    logToken={logToken}
                                    draftId={persistedDraftId}
                                />
                            ) : null}
                        </Collapse>

                        <IncompatibleCollections />

                        {draftInitializationError ? (
                            <AlertBox
                                short={false}
                                severity={draftInitializationError.severity}
                                sx={{
                                    mb: 2,
                                }}
                            >
                                {intl.formatMessage({
                                    id: draftInitializationError.messageId,
                                })}
                            </AlertBox>
                        ) : null}

                        {!isValidating && connectorTags.length === 0 ? (
                            <AlertBox severity="warning" short>
                                {intl.formatMessage({
                                    id: `${messagePrefix}.missingConnectors`,
                                })}
                            </AlertBox>
                        ) : connectorTags.length > 0 ? (
                            <ErrorBoundryWrapper>
                                <DetailsForm
                                    connectorTags={connectorTags}
                                    readOnly={readOnly.detailsForm}
                                    entityType={entityType}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {imageTag.connectorId ? (
                            <ErrorBoundryWrapper>
                                <EndpointConfig
                                    connectorImage={imageTag.id}
                                    readOnly={readOnly.endpointConfigForm}
                                    hideBorder={
                                        !hasLength(imageTag.connectorId)
                                    }
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {hasLength(imageTag.connectorId) ? (
                            <ErrorBoundryWrapper>
                                <CollectionConfig
                                    draftSpecs={taskDraftSpec}
                                    readOnly={readOnly.resourceConfigForm}
                                    hideBorder={!draftId}
                                    RediscoverButton={RediscoverButton}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        <CatalogEditor
                            messageId={`${messagePrefix}.finalReview.instructions`}
                        />

                        <PreSavePrompt />
                    </PromptsHydrator>
                </DraftSpecEditorHydrator>
            )}
        </>
    );
}

export default EntityEdit;
