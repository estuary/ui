import { Button } from '@mui/material';
import { generateDraftSpec, updateDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_isSaving,
    useEditorStore_persistedDraftId,
    useEditorStore_setId,
} from 'components/editor/Store';
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
    useEndpointConfigStore_encryptedEndpointConfig_data,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
    useEndpointConfig_serverUpdateRequired,
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
import { encryptEndpointConfig } from 'utils/sops-utils';

interface Props {
    disabled: boolean;
    callFailed: Function;
    mutateDraftSpecs: Function;
}

// TODO (optimization): Combine the generate button logic for materialization creation and edit.

function MaterializeGenerateButton({
    disabled,
    callFailed,
    mutateDraftSpecs,
}: Props) {
    // Details Form Store
    const entityName = useDetailsForm_details_entityName();
    const detailsFormsHasErrors = useDetailsForm_errorsExist();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();
    const imageConnectorId = useDetailsForm_connectorImage_connectorId();
    const imagePath = useDetailsForm_connectorImage_imagePath();

    // Draft Editor Store
    const isSaving = useEditorStore_isSaving();

    const setDraftId = useEditorStore_setId();

    const persistedDraftId = useEditorStore_persistedDraftId();

    // Endpoint Config Store
    const endpointSchema = useEndpointConfigStore_endpointSchema();

    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();

    const serverEndpointConfigData =
        useEndpointConfigStore_encryptedEndpointConfig_data();
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();

    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();

    const endpointConfigHasErrors = useEndpointConfigStore_errorsExist();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();

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

            const encryptedEndpointConfig = await encryptEndpointConfig(
                serverUpdateRequired
                    ? endpointConfigData
                    : serverEndpointConfigData,
                endpointSchema,
                serverUpdateRequired,
                imageConnectorId,
                imageConnectorTagId,
                callFailed,
                { overrideJsonFormDefaults: true }
            );

            const draftSpec = generateDraftSpec(
                encryptedEndpointConfig.data,
                imagePath,
                resourceConfig
            );

            const draftSpecsResponse = await updateDraftSpec(
                persistedDraftId,
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

            setEncryptedEndpointConfig(
                {
                    data: draftSpecsResponse.data[0].spec.endpoint.connector
                        .config,
                },
                'materialization_edit'
            );

            setPreviousEndpointConfig({ data: endpointConfigData });

            setDraftId(persistedDraftId);
            setFormState({
                status: FormStatus.GENERATED,
            });

            return mutateDraftSpecs();
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
