import { Button } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, generateDraftSpec } from 'api/draftSpecs';
import { encryptConfig } from 'api/oauth';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import {
    DraftEditorStoreNames,
    FormStateStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
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
import { EntityFormState, FormStatus } from 'stores/FormState';
import { ResourceConfigState } from 'stores/ResourceConfig';
import { ENTITY } from 'types';

interface Props {
    disabled: boolean;
    callFailed: Function;
    draftEditorStoreName: DraftEditorStoreNames;
    resourceConfigStoreName: ResourceConfigStoreNames;
    formStateStoreName: FormStateStoreNames;
}

function MaterializeGenerateButton({
    disabled,
    callFailed,
    draftEditorStoreName,
    resourceConfigStoreName,
    formStateStoreName,
}: Props) {
    // Details Form Store
    const entityName = useDetailsForm_details_entityName();
    const detailsFormsHasErrors = useDetailsForm_errorsExist();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();
    const imageConnectorId = useDetailsForm_connectorImage_connectorId();
    const imagePath = useDetailsForm_connectorImage_imagePath();

    // Draft Editor Store
    const isSaving = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >(draftEditorStoreName, (state) => state.isSaving);

    const resetEditorState = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['resetState']
    >(draftEditorStoreName, (state) => state.resetState);

    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >(draftEditorStoreName, (state) => state.setId);

    // Endpoint Config Store
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const endpointConfigHasErrors = useEndpointConfigStore_errorsExist();

    // Form State Store
    const formActive = useZustandStore<
        EntityFormState,
        EntityFormState['isActive']
    >(formStateStoreName, (state) => state.isActive);

    const setFormState = useZustandStore<
        EntityFormState,
        EntityFormState['setFormState']
    >(formStateStoreName, (state) => state.setFormState);

    const resetFormState = useZustandStore<
        EntityFormState,
        EntityFormState['resetFormState']
    >(formStateStoreName, (state) => state.resetFormState);

    // Resource Config Store
    const resourceConfig = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(resourceConfigStoreName, (state) => state.resourceConfig);

    const resourceConfigHasErrors = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(resourceConfigStoreName, (state) => state.resourceConfigErrorsExist);

    const generateCatalog = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        resetFormState(FormStatus.GENERATING);

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
                ENTITY.MATERIALIZATION
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
