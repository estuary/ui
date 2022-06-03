import { Button } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, generateDraftSpec } from 'api/draftSpecs';
import { encryptConfig } from 'api/sops';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
    entityCreateStoreSelectors,
    formInProgress,
    FormStatus,
} from 'stores/Create';
import { ENTITY } from 'types';

interface Props {
    disabled: boolean;
    onFailure: Function;
}

function MaterializeGenerateButton({ disabled, onFailure }: Props) {
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const isSaving = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >((state) => state.isSaving);

    const resetEditorState = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['resetState']
    >((state) => state.resetState);

    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >((state) => state.setId);

    const entityCreateStore = useRouteStore();

    const formStateStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const resetFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.reset
    );

    const entityName = entityCreateStore(
        entityCreateStoreSelectors.details.entityName
    );
    const imageTag = entityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const endpointConfigData = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );
    const endpointSchema = entityCreateStore(
        entityCreateStoreSelectors.endpointSchema
    );
    const resourceConfig = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.get
    );

    const endpointConfigHasErrors = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.hasErrors
    );
    const detailsFormsHasErrors = entityCreateStore(
        entityCreateStoreSelectors.details.hasErrors
    );
    const resourceConfigHasErrors = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.hasErrors
    );

    const generateCatalog = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        resetFormState(FormStatus.GENERATING_PREVIEW);

        if (
            resourceConfigHasErrors ||
            detailsFormsHasErrors ||
            endpointConfigHasErrors
        ) {
            setFormState({
                status: FormStatus.IDLE,
                displayValidation: true,
            });
        } else if (isEmpty(endpointConfigData)) {
            setFormState({
                status: FormStatus.IDLE,
                displayValidation: true,
            });
        } else {
            resetEditorState();
            setFormState({
                status: FormStatus.GENERATING_PREVIEW,
            });
            setDraftId(null);

            const draftsResponse = await createEntityDraft(entityName);
            if (draftsResponse.error) {
                return onFailure({
                    error: {
                        title: 'materializationCreate.test.failure.errorTitle',
                        error: draftsResponse.error,
                    },
                });
            }

            const encryptedEndpointConfig = await encryptConfig(
                endpointSchema,
                endpointConfigData
            );
            if (encryptedEndpointConfig.error) {
                return onFailure({
                    error: {
                        title: 'captureCreate.test.failedConfigEncryptTitle',
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
                return onFailure({
                    error: {
                        title: 'materializationCreate.test.failure.errorTitle',
                        error: draftSpecsResponse.error,
                    },
                });
            }

            setDraftId(newDraftId);
            setFormState({
                status: FormStatus.IDLE,
            });
        }
    };

    return (
        <Button
            onClick={generateCatalog}
            disabled={disabled || isSaving || formInProgress(formStateStatus)}
            type="submit"
            sx={buttonSx}
        >
            <FormattedMessage
                id={draftId ? 'cta.regenerateCatalog' : 'cta.generateCatalog'}
            />
        </Button>
    );
}

export default MaterializeGenerateButton;
