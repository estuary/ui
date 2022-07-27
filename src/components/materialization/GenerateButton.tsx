import { Button } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, generateDraftSpec } from 'api/draftSpecs';
import { encryptConfig } from 'api/sops';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import {
    DraftEditorStoreNames,
    EndpointConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';
import { EndpointConfigState } from 'stores/EndpointConfig';
import { ENTITY } from 'types';

interface Props {
    disabled: boolean;
    callFailed: Function;
    draftEditorStoreName: DraftEditorStoreNames;
    endpointConfigStoreName: EndpointConfigStoreNames;
}

function MaterializeGenerateButton({
    disabled,
    callFailed,
    draftEditorStoreName,
    endpointConfigStoreName,
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

    const useEntityCreateStore = useRouteStore();

    const formActive = useEntityCreateStore(
        entityCreateStoreSelectors.isActive
    );
    const setFormState = useEntityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const resetFormState = useEntityCreateStore(
        entityCreateStoreSelectors.formState.reset
    );

    const entityName = useEntityCreateStore(
        entityCreateStoreSelectors.details.entityName
    );
    const imageTag = useEntityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );

    const endpointConfigData = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfig']['data']
    >(endpointConfigStoreName, (state) => state.endpointConfig.data);

    const endpointSchema = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointSchema']
    >(endpointConfigStoreName, (state) => state.endpointSchema);

    const resourceConfig = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.get
    );

    const endpointConfigHasErrors = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrorsExist']
    >(endpointConfigStoreName, (state) => state.endpointConfigErrorsExist);

    const detailsFormsHasErrors = useEntityCreateStore(
        entityCreateStoreSelectors.details.hasErrors
    );
    const resourceConfigHasErrors = useEntityCreateStore(
        entityCreateStoreSelectors.resourceConfig.hasErrors
    );

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
                imageTag.imagePath,
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
