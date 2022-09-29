import { Button } from '@mui/material';
import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
import { generateCaptureDraftSpec, updateDraftSpec } from 'api/draftSpecs';
import { getLiveSpecsByLiveSpecId } from 'api/hydration';
import { encryptConfig } from 'api/oauth';
import {
    useEditorStore_editDraftId,
    useEditorStore_isSaving,
    useEditorStore_resetState,
    useEditorStore_setId,
    useEditorStore_setSpecs,
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
    useDetailsForm_connectorImage_imagePath,
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
import { ENTITY } from 'types';

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
    const setDraftId = useEditorStore_setId();

    const isSaving = useEditorStore_isSaving();

    const setDraftSpecs = useEditorStore_setSpecs();
    const resetEditorState = useEditorStore_resetState();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    const setFormState = useFormStateStore_setFormState();

    const updateFormStatus = useFormStateStore_updateStatus();

    // Details Form Store
    const entityName = useDetailsForm_details_entityName();
    const detailsFormsHasErrors = useDetailsForm_errorsExist();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();
    const imagePath = useDetailsForm_connectorImage_imagePath();
    const imageConnectorId = useDetailsForm_connectorImage_connectorId();

    // Endpoint Config Store
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const endpointConfigHasErrors = useEndpointConfigStore_errorsExist();

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
        } else if (
            liveSpecId &&
            editDraftId &&
            imageConnectorId === initialConnectorId
        ) {
            const liveSpecResponse = await getLiveSpecsByLiveSpecId(
                liveSpecId,
                ENTITY.CAPTURE
            );
            if (liveSpecResponse.error) {
                return callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: liveSpecResponse.error,
                    },
                });
            }

            if (liveSpecResponse.data) {
                const draftSpec = generateCaptureDraftSpec(
                    liveSpecResponse.data[0].spec.bindings,
                    endpointConfigData,
                    imagePath
                );

                const draftSpecsResponse = await updateDraftSpec(
                    editDraftId,
                    entityName,
                    draftSpec
                );
                if (draftSpecsResponse.error) {
                    return callFailed({
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
                            error: draftSpecsResponse.error,
                        },
                    });
                }

                if (draftSpecsResponse.data.length > 0) {
                    setDraftSpecs(draftSpecsResponse.data);
                }
            }

            setDraftId(editDraftId);
            updateFormStatus(FormStatus.GENERATED);
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

            const discoverResponse = await discover(
                entityName,
                encryptedEndpointConfig.data,
                imageConnectorTagId,
                draftsResponse.data[0].id
            );
            if (discoverResponse.error) {
                return callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: discoverResponse.error,
                    },
                });
            }
            subscription(draftsResponse.data[0].id);

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
