import { Button } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, generateDraftSpec } from 'api/draftSpecs';
import { encryptConfig } from 'api/oauth';
import {
    useEditorStore_isSaving,
    useEditorStore_resetState,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import { buttonSx } from 'components/shared/Entity/Header';
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
    useFormStateStore_isActive,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_resourceConfig,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig/hooks';

interface Props {
    disabled: boolean;
    callFailed: Function;
}

// TODO (optimization): Combine the generate button logic for materialization creation and edit.

function MaterializeGenerateButton({ disabled, callFailed }: Props) {
    // Details Form Store
    const entityName = useDetailsForm_details_entityName();
    const detailsFormsHasErrors = useDetailsForm_errorsExist();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();
    const imageConnectorId = useDetailsForm_connectorImage_connectorId();
    const imagePath = useDetailsForm_connectorImage_imagePath();

    // Draft Editor Store
    const isSaving = useEditorStore_isSaving();

    const resetEditorState = useEditorStore_resetState();

    const setDraftId = useEditorStore_setId();

    // Endpoint Config Store
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const endpointConfigHasErrors = useEndpointConfigStore_errorsExist();

    // Form State Store
    const formActive = useFormStateStore_isActive();

    const setFormState = useFormStateStore_setFormState();

    const updateFormStatus = useFormStateStore_updateStatus();

    // Resource Config Store
    const resourceConfig = useResourceConfig_resourceConfig();
    const resourceConfigHasErrors =
        useResourceConfig_resourceConfigErrorsExist();

    const generateCatalog = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        updateFormStatus(FormStatus.GENERATING);

        if (
            resourceConfigHasErrors ||
            detailsFormsHasErrors ||
            endpointConfigHasErrors
        ) {
            setFormState({
                status: FormStatus.FAILED,
                displayValidation: true,
            });
        } else if (isEmpty(endpointConfigData)) {
            setFormState({
                status: FormStatus.FAILED,
                displayValidation: true,
            });
        } else {
            resetEditorState();
            setDraftId(null);

            const draftsResponse = await createEntityDraft(entityName);
            if (draftsResponse.error) {
                return callFailed({
                    error: {
                        title: 'materializationCreate.generate.failure.errorTitle',
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

            const newDraftId = draftsResponse.data[0].id;
            const draftSpec = generateDraftSpec(
                encryptedEndpointConfig.data,
                imagePath,
                resourceConfig
            );

            const draftSpecsResponse = await createDraftSpec(
                newDraftId,
                entityName,
                draftSpec,
                'materialization'
            );
            if (draftSpecsResponse.error) {
                return callFailed({
                    error: {
                        title: 'materializationCreate.generate.failure.errorTitle',
                        error: draftSpecsResponse.error,
                    },
                });
            }

            setDraftId(newDraftId);
            setFormState({
                status: FormStatus.INIT,
            });
        }
    };

    return (
        <Button
            onClick={generateCatalog}
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
        >
            <FormattedMessage id="cta.generateCatalog.materialization" />
        </Button>
    );
}

export default MaterializeGenerateButton;
