import { Button } from '@mui/material';
import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
import { encryptConfig } from 'api/oauth';
import {
    useEditorStore_editDraftId,
    useEditorStore_isSaving,
    useEditorStore_resetState,
} from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
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
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_errorsExist,
} from 'stores/EndpointConfig';
import {
    FormStatus,
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState';

interface Props {
    disabled: boolean;
    callFailed: Function;
    subscription: Function;
}

function CaptureGenerateButton({ disabled, callFailed, subscription }: Props) {
    const [liveSpecId, initialConnectorId] = useGlobalSearchParams([
        GlobalSearchParams.LIVE_SPEC_ID,
        GlobalSearchParams.CONNECTOR_ID,
    ]);

    // Editor Store
    const editDraftId = useEditorStore_editDraftId();

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
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const endpointConfigHasErrors = useEndpointConfigStore_errorsExist();

    const editAssetsExist = liveSpecId && editDraftId;

    const generateCatalog = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        updateFormStatus(FormStatus.GENERATING);

        if (
            isEmpty(endpointConfigData) ||
            detailsFormsHasErrors ||
            endpointConfigHasErrors
        ) {
            return setFormState({
                status: FormStatus.FAILED,
                displayValidation: true,
            });
        } else {
            const encryptedEndpointConfig = await encryptConfig(
                imageConnectorId,
                imageConnectorTagId,
                endpointConfigData
            );
            if (
                encryptedEndpointConfig.error ||
                encryptedEndpointConfig.data.error
            ) {
                return callFailed({
                    error: {
                        title: 'entityCreate.sops.failedTitle',
                        error:
                            encryptedEndpointConfig.error ??
                            encryptedEndpointConfig.data.error,
                    },
                });
            }

            let catalogName = entityName;
            let draftId = editDraftId ?? '';

            if (editAssetsExist && imageConnectorId === initialConnectorId) {
                // The discovery RPC will insert a row into the draft spec-related tables for the given task with verbiage
                // identifying the external source appended to the task name (e.g., '/source-postgres'). To limit duplication
                // of draft spec-related data, the aforementioned external source identifier is removed from the task name
                // prior to executing the discovery RPC.
                const lastSlashIndex = entityName.lastIndexOf('/');

                if (lastSlashIndex !== -1) {
                    catalogName = entityName.slice(0, lastSlashIndex);
                }
            } else {
                resetEditorState();

                const draftsResponse = await createEntityDraft(entityName);
                if (draftsResponse.error) {
                    return callFailed({
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
                            error: draftsResponse.error,
                        },
                    });
                }

                draftId = draftsResponse.data[0].id;
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
