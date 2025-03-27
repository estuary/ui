import { Box, Collapse } from '@mui/material';
import DraftSpecEditorHydrator from 'components/editor/Store/DraftSpecsHydrator';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import useConnectorWithTagDetail from 'hooks/connectors/useConnectorWithTagDetail';
import { useEffect } from 'react';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import {
    useEndpointConfigStore_changed,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_error,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_logToken,
} from 'stores/FormState/hooks';
import EndpointConfig from '../EndpointConfig';
import EntityError from '../Error';
import useEntityWorkflowHelpers from '../hooks/useEntityWorkflowHelpers';
import { useFormHydrationChecker } from '../hooks/useFormHydrationChecker';
import useUnsavedChangesPrompt from '../hooks/useUnsavedChangesPrompt';
import ValidationErrorSummary from '../ValidationErrorSummary';
import { BaseEntityCreateProps } from './types';

const EntityCreateExpress = ({
    entityType,
    Toolbar: toolbar,
}: BaseEntityCreateProps) => {
    const { resetState } = useEntityWorkflowHelpers();

    const { error: connectorTagsError } = useConnectorWithTagDetail(entityType);
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

    return connectorTagsError ? (
        <Error condensed error={connectorTagsError} />
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

            <ErrorBoundryWrapper>
                <EndpointConfig hideWrapper />
            </ErrorBoundryWrapper>
        </DraftSpecEditorHydrator>
    );
};

export default EntityCreateExpress;
