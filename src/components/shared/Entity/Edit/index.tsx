import { Box, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import CollectionConfig from 'components/collection/Config';
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
import useUnsavedChangesPrompt from 'components/shared/Entity/hooks/useUnsavedChangesPrompt';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecSwrMetadata } from 'hooks/useDraftSpecs';
import { ReactNode, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
    useDetailsForm_connectorImage,
    useDetailsForm_hydrated,
} from 'stores/DetailsForm/hooks';
import {
    useEndpointConfigStore_changed,
    useEndpointConfig_hydrated,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
    useFormStateStore_messagePrefix,
} from 'stores/FormState/hooks';
import {
    useResourceConfig_hydrated,
    useResourceConfig_serverUpdateRequired,
} from 'stores/ResourceConfig/hooks';
import { EntityWithCreateWorkflow } from 'types';
import { hasLength } from 'utils/misc-utils';
import AlertBox from '../../AlertBox';

interface Props {
    callFailed: (formState: any, subscription?: RealtimeSubscription) => void;
    draftSpecMetadata: Pick<
        DraftSpecSwrMetadata,
        'draftSpecs' | 'isValidating' | 'error'
    >;
    entityType: EntityWithCreateWorkflow;
    errorSummary: ReactNode;
    readOnly: {
        detailsForm?: true;
        endpointConfigForm?: true;
        resourceConfigForm?: true;
    };
    resetState: () => void;
    title: string;
    toolbar: ReactNode;
    RediscoverButton?: ReactNode;
}

// eslint-disable-next-line complexity
function EntityEdit({
    title,
    entityType,
    readOnly,
    draftSpecMetadata,
    resetState,
    errorSummary,
    toolbar,
    RediscoverButton,
}: Props) {
    useBrowserTitle(title);

    const {
        connectorTags,
        error: connectorTagsError,
        isValidating,
    } = useConnectorWithTagDetail(entityType);

    // Details Form Store
    const detailsFormStoreHydrated = useDetailsForm_hydrated();
    const imageTag = useDetailsForm_connectorImage();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    const persistedDraftId = useEditorStore_persistedDraftId();

    const draftInitializationError = useEditorStore_draftInitializationError();

    // Endpoint Config Store
    const endpointConfigStoreHydrated = useEndpointConfig_hydrated();
    const endpointConfigChanged = useEndpointConfigStore_changed();
    const endpointConfigServerUpdateRequired =
        useEndpointConfig_serverUpdateRequired();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const logToken = useFormStateStore_logToken();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const formSubmitError = useFormStateStore_error();

    // Resource Config Store
    const resourceConfigStoreHydrated = useResourceConfig_hydrated();
    const resourceConfigServerUpdateRequired =
        useResourceConfig_serverUpdateRequired();

    const { draftSpecs } = draftSpecMetadata;

    const taskDraftSpec = useMemo(
        () => draftSpecs.filter(({ spec_type }) => spec_type === entityType),
        [draftSpecs, entityType]
    );

    useEffect(() => {
        const resetDraftIdFlag =
            endpointConfigServerUpdateRequired ||
            resourceConfigServerUpdateRequired;

        setDraftId(resetDraftIdFlag ? null : persistedDraftId);
    }, [
        setDraftId,
        endpointConfigServerUpdateRequired,
        persistedDraftId,
        resourceConfigServerUpdateRequired,
    ]);

    // TODO (defect): Trigger the prompt data loss modal if the resource config section changes.
    const promptDataLoss = endpointConfigChanged();
    useUnsavedChangesPrompt(!exitWhenLogsClose && promptDataLoss, resetState);

    const storeHydrationIncomplete =
        !detailsFormStoreHydrated ||
        !endpointConfigStoreHydrated ||
        !resourceConfigStoreHydrated;

    return (
        <>
            {toolbar}

            <Box sx={{ mb: 4 }}>{errorSummary}</Box>

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : !persistedDraftId || storeHydrationIncomplete ? null : (
                <>
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

                    {draftInitializationError ? (
                        <Box sx={{ mb: 2 }}>
                            <AlertBox
                                severity={draftInitializationError.severity}
                            >
                                <FormattedMessage
                                    id={draftInitializationError.messageId}
                                />
                            </AlertBox>
                        </Box>
                    ) : null}

                    {!isValidating && connectorTags.length === 0 ? (
                        <AlertBox severity="warning" short>
                            <FormattedMessage
                                id={`${messagePrefix}.missingConnectors`}
                            />
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
                                hideBorder={!hasLength(imageTag.connectorId)}
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

                    <ErrorBoundryWrapper>
                        <CatalogEditor
                            messageId={`${messagePrefix}.finalReview.instructions`}
                        />
                    </ErrorBoundryWrapper>
                </>
            )}
        </>
    );
}

export default EntityEdit;
