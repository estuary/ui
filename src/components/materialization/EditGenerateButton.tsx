import { Button } from '@mui/material';
import { generateDraftSpec, updateDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_editDraftId,
    useEditorStore_isSaving,
    useEditorStore_setId,
} from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
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
import {
    useResourceConfig_resourceConfig,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig';

interface Props {
    disabled: boolean;
    callFailed: Function;
}

function MaterializeGenerateButton({ disabled, callFailed }: Props) {
    // Details Form Store
    const entityName = useDetailsForm_details_entityName();
    const detailsFormsHasErrors = useDetailsForm_errorsExist();
    const imagePath = useDetailsForm_connectorImage_imagePath();

    // Draft Editor Store
    const isSaving = useEditorStore_isSaving();

    const setDraftId = useEditorStore_setId();

    const editDraftId = useEditorStore_editDraftId();

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
            setDraftId(null);

            // TODO (Edit) We can add this back when you can change the endpoint config
            //  Might be better to just get the create GenerateButton sharable for edit

            // const encryptedEndpointConfig = await encryptConfig(
            //     imageConnectorId,
            //     imageConnectorTagId,
            //     endpointConfigData
            // );
            // if (
            //     encryptedEndpointConfig.error ||
            //     encryptedEndpointConfig.data.error
            // ) {
            //     return callFailed({
            //         error: {
            //             title: 'entityCreate.sops.failedTitle',
            //             error:
            //                 encryptedEndpointConfig.error ??
            //                 encryptedEndpointConfig.data.error,
            //         },
            //     });
            // }

            const draftSpec = generateDraftSpec(
                endpointConfigData,
                imagePath,
                resourceConfig
            );

            const draftSpecsResponse = await updateDraftSpec(
                editDraftId,
                entityName,
                draftSpec
            );
            if (draftSpecsResponse.error) {
                return callFailed({
                    error: {
                        title: 'materializationCreate.generate.failure.errorTitle',
                        error: draftSpecsResponse.error,
                    },
                });
            }

            setDraftId(editDraftId);
            setFormState({
                status: FormStatus.GENERATED,
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
