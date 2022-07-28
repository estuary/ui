import { Button } from '@mui/material';
import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
import { encryptConfig } from 'api/sops';
import { EditorStoreState } from 'components/editor/Store';
import { buttonSx } from 'components/shared/Entity/Header';
import {
    DetailsFormStoreNames,
    DraftEditorStoreNames,
    EndpointConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { isEmpty } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { entityCreateStoreSelectors } from 'stores/Create';
import { DetailsFormState, FormStatus } from 'stores/DetailsForm';
import { EndpointConfigState } from 'stores/EndpointConfig';

interface Props {
    disabled: boolean;
    callFailed: Function;
    subscription: Function;
    draftEditorStoreName: DraftEditorStoreNames;
    endpointConfigStoreName: EndpointConfigStoreNames;
    detailsFormStoreName: DetailsFormStoreNames;
}

function CaptureGenerateButton({
    disabled,
    callFailed,
    subscription,
    draftEditorStoreName,
    endpointConfigStoreName,
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

    const useEntityCreateStore = useRouteStore();

    const formActive = useEntityCreateStore(
        entityCreateStoreSelectors.isActive
    );

    const setFormState = useZustandStore<
        DetailsFormState,
        DetailsFormState['setFormState']
    >(detailsFormStoreName, (state) => state.setFormState);

    const resetFormState = useZustandStore<
        DetailsFormState,
        DetailsFormState['resetFormState']
    >(detailsFormStoreName, (state) => state.resetFormState);

    const entityName = useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['entityName']
    >(detailsFormStoreName, (state) => state.details.data.entityName);

    const imageTag = useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']
    >(detailsFormStoreName, (state) => state.details.data.connectorImage);

    const endpointConfigData = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfig']['data']
    >(endpointConfigStoreName, (state) => state.endpointConfig.data);

    const endpointSchema = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointSchema']
    >(endpointConfigStoreName, (state) => state.endpointSchema);

    const endpointConfigHasErrors = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrorsExist']
    >(endpointConfigStoreName, (state) => state.endpointConfigErrorsExist);

    const detailsFormsHasErrors = useZustandStore<
        DetailsFormState,
        DetailsFormState['detailsFormErrorsExist']
    >(detailsFormStoreName, (state) => state.detailsFormErrorsExist);

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
                        title: 'entityCreate.sops.failedTitle',
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
                imageTag ? imageTag.id : '',
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
