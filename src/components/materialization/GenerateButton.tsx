import { Button } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import {
    createDraftSpec,
    DraftSpecsExtQuery_ByCatalogName,
    getDraftSpecsByCatalogName,
    modifyDraftSpec,
} from 'api/draftSpecs';
import {
    useEditorStore_isSaving,
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
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
    useDetailsForm_setDraftedEntityName,
} from 'stores/DetailsForm/hooks';
import {
    useEndpointConfigStore_encryptedEndpointConfig_data,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig/hooks';
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
import { encryptEndpointConfig } from 'utils/sops-utils';
import { generateTaskSpec } from 'utils/workflow-utils';

interface Props {
    disabled: boolean;
    callFailed: Function;
    mutateDraftSpecs: Function;
}

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

    const setDraftedEntityName = useDetailsForm_setDraftedEntityName();

    // Draft Editor Store
    const isSaving = useEditorStore_isSaving();

    const resetEditorState = useEditorStore_resetState();

    const setDraftId = useEditorStore_setId();

    const persistedDraftId = useEditorStore_persistedDraftId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

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
            resetEditorState(true);

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

            let evaluatedDraftId = persistedDraftId;
            let existingTaskData: DraftSpecsExtQuery_ByCatalogName | null =
                null;

            if (persistedDraftId) {
                const existingDraftSpecResponse =
                    await getDraftSpecsByCatalogName(
                        persistedDraftId,
                        entityName,
                        'materialization'
                    );

                if (existingDraftSpecResponse.error) {
                    return callFailed({
                        error: {
                            title: 'materializationCreate.generate.failure.errorTitle',
                            error: existingDraftSpecResponse.error,
                        },
                    });
                } else if (
                    existingDraftSpecResponse.data &&
                    existingDraftSpecResponse.data.length > 0
                ) {
                    existingTaskData = existingDraftSpecResponse.data[0];
                }
            } else {
                const draftsResponse = await createEntityDraft(entityName);

                if (draftsResponse.error) {
                    return callFailed({
                        error: {
                            title: 'materializationCreate.generate.failure.errorTitle',
                            error: draftsResponse.error,
                        },
                    });
                }

                evaluatedDraftId = draftsResponse.data[0].id;
            }

            const draftSpec = generateTaskSpec(
                'materialization',
                { image: imagePath, config: encryptedEndpointConfig.data },
                resourceConfig,
                existingTaskData
            );

            const draftSpecsResponse =
                persistedDraftId && existingTaskData
                    ? await modifyDraftSpec(draftSpec, {
                          draft_id: evaluatedDraftId,
                          catalog_name: entityName,
                          spec_type: 'materialization',
                      })
                    : await createDraftSpec(
                          evaluatedDraftId,
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

            setEncryptedEndpointConfig({
                data: draftSpecsResponse.data[0].spec.endpoint.connector.config,
            });

            setPreviousEndpointConfig({ data: endpointConfigData });

            setDraftId(evaluatedDraftId);
            setPersistedDraftId(evaluatedDraftId);

            setDraftedEntityName(draftSpecsResponse.data[0].catalog_name);

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
