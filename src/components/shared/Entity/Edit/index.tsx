import { EntityWithCreateWorkflow } from 'types';

import { ReactNode, useEffect, useMemo } from 'react';

import { FormattedMessage } from 'react-intl';

import { Box, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';

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
import useUnsavedChangesPrompt from 'components/shared/Entity/hooks/useUnsavedChangesPrompt';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';

import useBrowserTitle from 'hooks/useBrowserTitle';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecSwrMetadata } from 'hooks/useDraftSpecs';

import {
    useDetailsForm_connectorImage,
    useDetailsForm_draftedEntityName,
    useDetailsForm_hydrated,
} from 'stores/DetailsForm/hooks';
import {
    useEndpointConfig_hydrated,
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_changed,
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

import { hasLength } from 'utils/misc-utils';

import AlertBox from '../../AlertBox';
import IncompatibleCollections from '../IncompatibleCollections';
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
    callFailed: (formState: any, subscription?: RealtimeSubscription) => void;
    resetState: () => void;
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
    const entityName = useDetailsForm_draftedEntityName();

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

            <Box sx={{ mb: 4 }}>
                <ValidationErrorSummary />
            </Box>

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : !persistedDraftId || storeHydrationIncomplete ? null : (
                <DraftSpecEditorHydrator
                    entityType={entityType}
                    entityName={entityName}
                >
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

                    <CatalogEditor
                        messageId={`${messagePrefix}.finalReview.instructions`}
                    />
                </DraftSpecEditorHydrator>
            )}
        </>
    );
}

export default EntityEdit;
