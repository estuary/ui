import { Button } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import {
    createDraftSpec,
    DraftSpecsExtQuery_ByCatalogName,
    getDraftSpecsByDraftId,
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

const ENTITY_TYPE = 'materialization';

function MaterializeGenerateButton({
    disabled,
    callFailed,
    mutateDraftSpecs,
}: Props) {
    const isEdit = useEntityWorkflow_Editing();

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

            if (persistedDraftId) {
                // See if there is an existing materialization tied to the persisted draft id
                const existingDraftSpecResponse = await getDraftSpecsByDraftId(
                    persistedDraftId,
                    ENTITY_TYPE
                );

                if (existingDraftSpecResponse.error) {
                    return callFailed({
                        error: {
                            title: 'materializationCreate.generate.failure.errorTitle',
                            error: existingDraftSpecResponse.error,
                        },
                    });
                }

                // Populate the existing if available. This might not exist if the user edited a collection
                //  as their first action before clicking this button
                if (
                    existingDraftSpecResponse.data &&
                    existingDraftSpecResponse.data.length > 0
                ) {
                    existingTaskData = existingDraftSpecResponse.data[0];
                }
            } else {
                // No existing draft so start a new one
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

                // Since we made a new one override the current draft id
                evaluatedDraftId = draftsResponse.data[0].id;
            }

            // Generate the draft spec that will be sent to the server next
            const draftSpec = generateTaskSpec(
                ENTITY_TYPE,
                { image: imagePath, config: encryptedEndpointConfig.data },
                resourceConfig,
                existingTaskData
            );

            // If there is a draft already with task data then update. We do not match on
            //   the catalog name as the user could change the name. There is a small issue
            //      if someone updates their draft on the CLI and adds multiple materializations
            //      there will be an issue. This will need to be handled eventually but by then
            //      we should move the UI to the "shopping cart" approach.
            const draftSpecsResponse =
                persistedDraftId && existingTaskData
                    ? await modifyDraftSpec(
                          draftSpec,
                          {
                              draft_id: evaluatedDraftId,
                              spec_type: ENTITY_TYPE,
                          },
                          processedEntityName
                      )
                    : await createDraftSpec(
                          evaluatedDraftId,
                          processedEntityName,
                          draftSpec,
                          ENTITY_TYPE
                      );

            if (draftSpecsResponse.error) {
                return callFailed({
                    error: {
                        title: 'materializationCreate.generate.failure.errorTitle',
                        error: draftSpecsResponse.error,
                    },
                });
            }

            // Update all the store state
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
