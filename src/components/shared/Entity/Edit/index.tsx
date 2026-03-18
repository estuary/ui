import type { ReactNode } from 'react';
import type { DraftSpecSwrMetadata } from 'src/hooks/useDraftSpecs';
import type { EntityWithCreateWorkflow } from 'src/types';

import { useEffect, useMemo } from 'react';

import { Box, Collapse } from '@mui/material';

import { closeSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { useUnmount } from 'react-use';

import CollectionConfig from 'src/components/collection/Config';
import DraftSpecEditorHydrator from 'src/components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_draftInitializationError,
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
import IncompatibleCollections from 'src/components/shared/Entity/IncompatibleCollections';
import ValidationErrorSummary from 'src/components/shared/Entity/ValidationErrorSummary';
import Error from 'src/components/shared/Error';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import useBrowserTitle from 'src/hooks/useBrowserTitle';
import { logRocketEvent } from 'src/services/shared';
import { BASE_ERROR } from 'src/services/supabase';
import { CustomEvents } from 'src/services/types';
import {
    useBinding_rediscoveryRequired,
    useBinding_serverUpdateRequired,
} from 'src/stores/Binding/hooks';
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

    // Binding Store
    const resourceConfigServerUpdateRequired =
        useBinding_serverUpdateRequired();
    const rediscoveryRequired = useBinding_rediscoveryRequired();

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

    useUnmount(() => {
        closeSnackbar();
    });

    useEffect(() => {
        const resetDraftIdFlag =
            endpointConfigServerUpdateRequired ||
            resourceConfigServerUpdateRequired ||
            rediscoveryRequired;

        const newValue = resetDraftIdFlag ? null : persistedDraftId;

        logRocketEvent(CustomEvents.DRAFT_ID_SET, {
            rediscoveryRequired,
            endpointConfigServerUpdateRequired,
            resourceConfigServerUpdateRequired,
            newValue,
            component: 'EntityEdit',
        });

        setDraftId(newValue);
    }, [
        setDraftId,
        endpointConfigServerUpdateRequired,
        persistedDraftId,
        resourceConfigServerUpdateRequired,
        rediscoveryRequired,
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

            {detailsHydrationError ? (
                <Error
                    condensed
                    error={{
                        ...BASE_ERROR,
                        message: detailsHydrationError,
                    }}
                />
            ) : !persistedDraftId || !storeHydrationComplete ? null : (
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

                    <ErrorBoundryWrapper>
                        <DetailsForm
                            readOnly={readOnly.detailsForm}
                            entityType={entityType}
                        />
                    </ErrorBoundryWrapper>

                    <ErrorBoundryWrapper>
                        <EndpointConfig
                            readOnly={readOnly.endpointConfigForm}
                            hideBorder={!hasLength(imageTag.connectorId)}
                        />
                    </ErrorBoundryWrapper>

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
