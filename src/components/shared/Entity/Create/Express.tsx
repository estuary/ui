import type { BaseEntityCreateProps } from 'src/components/shared/Entity/Create/types';

import { useEffect } from 'react';

import { Box, Collapse } from '@mui/material';

import DraftSpecEditorHydrator from 'src/components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'src/components/editor/Store/hooks';
import EndpointConfig from 'src/components/shared/Entity/EndpointConfig';
import EntityError from 'src/components/shared/Entity/Error';
import useEntityWorkflowHelpers from 'src/components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useFormHydrationChecker } from 'src/components/shared/Entity/hooks/useFormHydrationChecker';
import useUnsavedChangesPrompt from 'src/components/shared/Entity/hooks/useUnsavedChangesPrompt';
import ValidationErrorSummary from 'src/components/shared/Entity/ValidationErrorSummary';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_changed,
} from 'src/stores/EndpointConfig/hooks';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
} from 'src/stores/FormState/hooks';

const EntityCreateExpress = ({
    entityType,
    Toolbar: toolbar,
}: BaseEntityCreateProps) => {
    const { resetState } = useEntityWorkflowHelpers();

    const storeHydrationComplete = useFormHydrationChecker();

    const entityName = useDetailsFormStore((state) => state.draftedEntityName);

    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();
    const persistedDraftId = useEditorStore_persistedDraftId();

    const endpointConfigChanged = useEndpointConfigStore_changed();
    const endpointConfigServerUpdateRequired =
        useEndpointConfig_serverUpdateRequired();

    const logToken = useFormStateStore_logToken();
    const formSubmitError = useFormStateStore_error();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    useEffect(() => {
        setDraftId(
            endpointConfigServerUpdateRequired ? null : persistedDraftId
        );
    }, [setDraftId, endpointConfigServerUpdateRequired, persistedDraftId]);

    // TODO (defect): Trigger the prompt data loss modal if the resource config section changes.
    useUnsavedChangesPrompt(
        !exitWhenLogsClose && endpointConfigChanged,
        resetState
    );

    return !storeHydrationComplete ? null : (
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

            <ErrorBoundryWrapper>
                <EndpointConfig hideWrapper />
            </ErrorBoundryWrapper>
        </DraftSpecEditorHydrator>
    );
};

export default EntityCreateExpress;
