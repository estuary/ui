import { Button } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, generateDraftSpec } from 'api/draftSpecs';
import { encryptConfig } from 'api/sops';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import {
    DetailsFormStoreNames,
    DraftEditorStoreNames,
    EndpointConfigStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { EndpointConfigState } from 'stores/EndpointConfig';
import { CreateState, FormStatus } from 'stores/MiniCreate';
import { ResourceConfigState } from 'stores/ResourceConfig';
import { ENTITY } from 'types';

interface Props {
    disabled: boolean;
    callFailed: Function;
    draftEditorStoreName: DraftEditorStoreNames;
    endpointConfigStoreName: EndpointConfigStoreNames;
    resourceConfigStoreName: ResourceConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
}

function MaterializeGenerateButton({
    disabled,
    callFailed,
    draftEditorStoreName,
    endpointConfigStoreName,
    resourceConfigStoreName,
    detailsFormStoreName,
}: Props) {
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

    const formActive = useZustandStore<CreateState, CreateState['isActive']>(
        detailsFormStoreName,
        (state) => state.isActive
    );

    const setFormState = useZustandStore<
        CreateState,
        CreateState['setFormState']
    >(detailsFormStoreName, (state) => state.setFormState);

    const resetFormState = useZustandStore<
        CreateState,
        CreateState['resetFormState']
    >(detailsFormStoreName, (state) => state.resetFormState);

    const entityName = useZustandStore<
        CreateState,
        CreateState['details']['data']['entityName']
    >(detailsFormStoreName, (state) => state.details.data.entityName);

    const imageTag = useZustandStore<
        CreateState,
        CreateState['details']['data']['connectorImage']
    >(detailsFormStoreName, (state) => state.details.data.connectorImage);

    const endpointConfigData = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfig']['data']
    >(endpointConfigStoreName, (state) => state.endpointConfig.data);

    const endpointSchema = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointSchema']
    >(endpointConfigStoreName, (state) => state.endpointSchema);

    const resourceConfig = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfig']
    >(resourceConfigStoreName, (state) => state.resourceConfig);

    const endpointConfigHasErrors = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrorsExist']
    >(endpointConfigStoreName, (state) => state.endpointConfigErrorsExist);

    const detailsFormsHasErrors = useZustandStore<
        CreateState,
        CreateState['detailsFormErrorsExist']
    >(detailsFormStoreName, (state) => state.detailsFormErrorsExist);

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
                endpointSchema,
                endpointConfigData
            );
            if (encryptedEndpointConfig.error) {
                return callFailed({
                    error: {
                        title: 'entityCreate.sops.failedTitle',
                        error: encryptedEndpointConfig.error,
                    },
                });
            }

            const newDraftId = draftsResponse.data[0].id;
            const draftSpec = generateDraftSpec(
                encryptedEndpointConfig.data,
                imageTag ? imageTag.iconPath : '',
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
