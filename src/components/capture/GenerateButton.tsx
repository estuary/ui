import { Button } from '@mui/material';
import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
import { encryptConfig } from 'api/sops';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { DraftEditorStoreNames, useZustandStore } from 'hooks/useZustand';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

interface Props {
    disabled: boolean;
    callFailed: Function;
    subscription: Function;
    draftEditorStoreName: DraftEditorStoreNames;
}

function CaptureGenerateButton({
    disabled,
    callFailed,
    subscription,
    draftEditorStoreName,
}: Props) {
    const isSaving = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['isSaving']
    >(draftEditorStoreName, (state) => state.isSaving);

    const resetEditorState = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['resetState']
    >(draftEditorStoreName, (state) => state.resetState);

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
    const endpointConfigData = useEntityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );
    const endpointSchema = useEntityCreateStore(
        entityCreateStoreSelectors.endpointSchema
    );

    const endpointConfigHasErrors = useEntityCreateStore(
        entityCreateStoreSelectors.endpointConfig.hasErrors
    );
    const detailsFormsHasErrors = useEntityCreateStore(
        entityCreateStoreSelectors.details.hasErrors
    );

    const generateCatalog = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        resetFormState(FormStatus.GENERATING);

        if (
            isEmpty(endpointConfigData) ||
            detailsFormsHasErrors ||
            endpointConfigHasErrors
        ) {
            return setFormState({
                status: FormStatus.FAILED,
                displayValidation: true,
            });
        } else {
            resetEditorState();
            const draftsResponse = await createEntityDraft(entityName);
            if (draftsResponse.error) {
                return callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
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
                        title: 'captureCreate.generate.failedConfigEncryptTitle',
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
                return callFailed(
                    {
                        error: {
                            title: 'captureCreate.generate.failedErrorTitle',
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
            onClick={generateCatalog}
            disabled={disabled || isSaving || formActive}
            sx={buttonSx}
        >
            <FormattedMessage id="cta.generateCatalog.capture" />
        </Button>
    );
}

export default CaptureGenerateButton;
