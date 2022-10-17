import { Button } from '@mui/material';
import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
import {
    useEditorStore_isSaving,
    useEditorStore_resetState,
} from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { useEntityWorkflow } from 'context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
    useDetailsForm_connectorImage_connectorId,
    useDetailsForm_connectorImage_id,
    useDetailsForm_details_entityName,
    useDetailsForm_errorsExist,
} from 'stores/DetailsForm';
import {
    useEndpointConfigStore_changed,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig';
import {
    FormStatus,
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState';
import { encryptEndpointConfig } from 'utils/workflow-utils';

interface Props {
    disabled: boolean;
    callFailed: Function;
    subscription: Function;
}

function CaptureGenerateButton({ disabled, callFailed, subscription }: Props) {
    const initialConnectorId = useGlobalSearchParams(
        GlobalSearchParams.CONNECTOR_ID
    );

    const workflow = useEntityWorkflow();
    const editWorkflow = workflow === 'capture_edit';

    // Editor Store
    const isSaving = useEditorStore_isSaving();

    const resetEditorState = useEditorStore_resetState();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    const setFormState = useFormStateStore_setFormState();

    const updateFormStatus = useFormStateStore_updateStatus();

    // Details Form Store
    const entityName = useDetailsForm_details_entityName();
    const detailsFormsHasErrors = useDetailsForm_errorsExist();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();
    const imageConnectorId = useDetailsForm_connectorImage_connectorId();

    // Endpoint Config Store
    const endpointSchema = useEndpointConfigStore_endpointSchema();

    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();

    const endpointConfigChanged = useEndpointConfigStore_changed();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();

    const endpointConfigErrorFlag = editWorkflow
        ? endpointConfigChanged() && endpointConfigErrorsExist
        : endpointConfigErrorsExist;

    const generateCatalog = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        updateFormStatus(FormStatus.GENERATING);

        if (
            isEmpty(endpointConfigData) ||
            detailsFormsHasErrors ||
            endpointConfigErrorFlag
        ) {
            return setFormState({
                status: FormStatus.FAILED,
                displayValidation: true,
            });
        } else {
            resetEditorState(editWorkflow);

            const draftsResponse = await createEntityDraft(entityName);
            if (draftsResponse.error) {
                return callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: draftsResponse.error,
                    },
                });
            }

            const draftId = draftsResponse.data[0].id;

            const encryptedEndpointConfig = await encryptEndpointConfig(
                endpointConfigData,
                endpointSchema,
                serverUpdateRequired,
                imageConnectorId,
                imageConnectorTagId,
                callFailed
            );

            let catalogName = entityName;

            if (editWorkflow && imageConnectorId === initialConnectorId) {
                // The discovery RPC will insert a row into the draft spec-related tables for the given task with verbiage
                // identifying the external source appended to the task name (e.g., '/source-postgres'). To limit duplication
                // of draft spec-related data, the aforementioned external source identifier is removed from the task name
                // prior to executing the discovery RPC.
                const lastSlashIndex = entityName.lastIndexOf('/');

                if (lastSlashIndex !== -1) {
                    catalogName = entityName.slice(0, lastSlashIndex);
                }
            }

            const discoverResponse = await discover(
                catalogName,
                encryptedEndpointConfig.data,
                imageConnectorTagId,
                draftId
            );
            if (discoverResponse.error) {
                return callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: discoverResponse.error,
                    },
                });
            }
            subscription(draftId);

            setFormState({
                logToken: discoverResponse.data[0].logs_token,
            });
        }
    };

    return (
        <Button
            onClick={generateCatalog}
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
        >
            <FormattedMessage id="cta.generateCatalog.capture" />
        </Button>
    );
}

export default CaptureGenerateButton;
