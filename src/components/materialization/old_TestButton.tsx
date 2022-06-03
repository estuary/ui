import { Button, SxProps, Theme } from '@mui/material';
import { createEntityDraft } from 'api/drafts';
import { createDraftSpec, generateDraftSpec } from 'api/draftSpecs';
import { createPublication } from 'api/publications';
import { encryptConfig } from 'api/sops';
import { EditorStoreState } from 'components/editor/Store';
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
    subscription: Function;
}

const buttonSx: SxProps<Theme> = { ml: 1, borderRadius: 5 };

function MaterializeTestButton({ disabled, onFailure, subscription }: Props) {
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

    const entityCreateStore = useRouteStore();

    // Materializations store
    const resourceConfig = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.get
    );
    const formStateStatus = entityCreateStore(
        entityCreateStoreSelectors.formState.status
    );
    const resetFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.reset
    );

    // Form store
    const entityName = entityCreateStore(
        entityCreateStoreSelectors.details.entityName
    );
    const imageTag = entityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const endpointConfig = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );
    const endpointSchema = entityCreateStore(
        entityCreateStoreSelectors.endpointSchema
    );

    const messagePrefix = entityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );

    const resourceConfigHasErrors = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.hasErrors
    );
    const endpointConfigHasErrors = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.hasErrors
    );
    const detailsFormsHasErrors = entityCreateStore(
        entityCreateStoreSelectors.details.hasErrors
    );

    // Editor state

    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >((state) => state.setId);

    const test = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        resetFormState(FormStatus.TESTING);

        if (
            resourceConfigHasErrors ||
            detailsFormsHasErrors ||
            endpointConfigHasErrors
        ) {
            setFormState({
                status: FormStatus.IDLE,
                displayValidation: true,
            });
        } else if (isEmpty(resourceConfig)) {
            // TODO: Handle the scenario where no collections are present.
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
                endpointConfig
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

            resetFormState(FormStatus.TESTING);
            const publicationsSubscription = subscription(newDraftId);
            const dryRunResponse = await createPublication(newDraftId, true);

            if (dryRunResponse.error) {
                return onFailure(
                    {
                        error: {
                            title: `${messagePrefix}.test.failure.errorTitle`,
                            error: dryRunResponse.error,
                        },
                    },
                    publicationsSubscription
                );
            }

            setDraftId(dryRunResponse.data[0].draft_id);
            setFormState({
                status: FormStatus.IDLE,
            });
        }
    };

    return (
        <Button
            onClick={test}
            disabled={disabled || isSaving || formInProgress(formStateStatus)}
            type="submit"
            sx={buttonSx}
        >
            <FormattedMessage
                id={draftId ? 'foo.ctas.discoverAgain' : 'foo.ctas.discover'}
            />
        </Button>
    );
}

export default MaterializeTestButton;
