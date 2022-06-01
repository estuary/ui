import { Button } from '@mui/material';
import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
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

interface Props {
    disabled: boolean;
    formId: string;
    onFailure: Function;
    subscription: Function;
}

function CaptureTestButton({
    disabled,
    formId,
    onFailure,
    subscription,
}: Props) {
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
    const [detailErrors, specErrors] = entityCreateStore(
        entityCreateStoreSelectors.errors
    );

    const test = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        resetFormState(FormStatus.TESTING);

        let detailHasErrors = false;
        let specHasErrors = false;

        // TODO (linting) - this was to make TS/Linting happy
        detailHasErrors = detailErrors ? detailErrors.length > 0 : false;
        specHasErrors = specErrors ? specErrors.length > 0 : false;
        if (isEmpty(endpointConfigData) || detailHasErrors || specHasErrors) {
            return setFormState({
                status: FormStatus.IDLE,
                displayValidation: true,
            });
        } else {
            resetEditorState();
            const draftsResponse = await createEntityDraft(entityName);
            if (draftsResponse.error) {
                return onFailure({
                    error: {
                        title: 'captureCreate.test.failedErrorTitle',
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

            const discoversSubscription = subscription(
                draftsResponse.data[0].id
            );
            const discoverResponse = await discover(
                entityName,
                encryptedEndpointConfig.data,
                imageTag.id,
                draftsResponse.data[0].id
            );
            if (discoverResponse.error) {
                return onFailure(
                    {
                        error: {
                            title: 'captureCreate.test.failedErrorTitle',
                            error: discoverResponse.error,
                        },
                    },
                    discoversSubscription
                );
            }

            setFormState({
                logToken: discoverResponse.data[0].logs_token,
            });
        }
    };

    return (
        <Button
            onClick={test}
            disabled={disabled || isSaving || formInProgress(formStateStatus)}
            form={formId}
            type="submit"
            sx={buttonSx}
        >
            <FormattedMessage
                id={draftId ? 'foo.ctas.discoverAgain' : 'foo.ctas.discover'}
            />
        </Button>
    );
}

export default CaptureTestButton;
