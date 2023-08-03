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
import useEntityWorkflowHelpers from 'components/shared/Entity/hooks/useEntityWorkflowHelpers';
import { useEntityWorkflow_Editing } from 'context/Workflow';
import useEntityNameSuffix from 'hooks/useEntityNameSuffix';
import { FormattedMessage } from 'react-intl';
import {
    useDetailsForm_connectorImage_connectorId,
    useDetailsForm_connectorImage_id,
    useDetailsForm_connectorImage_imagePath,
    useDetailsForm_entityNameChanged,
    useDetailsForm_errorsExist,
    useDetailsForm_setDraftedEntityName,
} from 'stores/DetailsForm/hooks';
import {
    useEndpointConfig_serverUpdateRequired,
    useEndpointConfigStore_encryptedEndpointConfig_data,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
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
    mutateDraftSpecs: Function;
}

function MaterializeGenerateButton({ disabled, mutateDraftSpecs }: Props) {
    const isEdit = useEntityWorkflow_Editing();
    const { callFailed } = useEntityWorkflowHelpers();

    // Details Form Store
    const detailsFormsHasErrors = useDetailsForm_errorsExist();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();
    const imageConnectorId = useDetailsForm_connectorImage_connectorId();
    const imagePath = useDetailsForm_connectorImage_imagePath();
    const setDraftedEntityName = useDetailsForm_setDraftedEntityName();
    const entityNameChanged = useDetailsForm_entityNameChanged();

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

    // After the first generation we already have a name with the
    //  image name suffix (unless name changed)

    // The order of the OR statement below is SUPER important because the
    //  entity name change variable will flip to true more often
    //      If there is NO persisted draft ID
    //          - process the name
    //      If there is a persisted draft ID BUT the name changed
    //          - process the name
    //      If there is persisted draft ID
    //          - get the draft name
    const processedEntityName = useEntityNameSuffix(
        !isEdit && (!persistedDraftId || entityNameChanged)
    );

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

            // Similar to processing we need to see if the name changed
            //  that way we don't create multiple "materializations" with different names
            //  all under the same draft. Otherwise we would then try to publish
            //  all of those documents and not just the final name
            if (persistedDraftId && !entityNameChanged) {
                const existingDraftSpecResponse =
                    await getDraftSpecsByCatalogName(
                        persistedDraftId,
                        processedEntityName,
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
                const draftsResponse = await createEntityDraft(
                    processedEntityName
                );

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
                          catalog_name: processedEntityName,
                          spec_type: 'materialization',
                      })
                    : await createDraftSpec(
                          evaluatedDraftId,
                          processedEntityName,
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
