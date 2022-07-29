import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import FooHeader from 'components/shared/Entity/Header';
import PageContainer from 'components/shared/PageContainer';
import {
    DetailsFormStoreNames,
    DraftEditorStoreNames,
    EndpointConfigStoreNames,
    ResourceConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { useClient } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import { entityCreateStoreSelectors } from 'stores/Create';
import { EndpointConfigState } from 'stores/EndpointConfig';
import { CreateState, FormStatus } from 'stores/MiniCreate';
import { ResourceConfigState } from 'stores/ResourceConfig';

const connectorType = 'materialization';

function MaterializationCreate() {
    const navigate = useNavigate();

    // Supabase
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorWithTagDetail(connectorType);
    const hasConnectors = connectorTags.length > 0;

    const draftEditorStoreName = DraftEditorStoreNames.MATERIALIZATION;

    const detailsFormStoreName = DetailsFormStoreNames.MATERIALIZATION_CREATE;

    const endpointConfigStoreName =
        EndpointConfigStoreNames.MATERIALIZATION_CREATE;

    const resourceConfigStoreName =
        ResourceConfigStoreNames.MATERIALIZATION_CREATE;

    const useEntityCreateStore = useRouteStore();
    const imageTag = useZustandStore<
        CreateState,
        CreateState['details']['data']['connectorImage']
    >(detailsFormStoreName, (state) => state.details.data.connectorImage);

    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const detailsFormErrorsExist = useZustandStore<
        CreateState,
        CreateState['detailsFormErrorsExist']
    >(detailsFormStoreName, (state) => state.detailsFormErrorsExist);

    const endpointConfigErrorsExist = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrorsExist']
    >(endpointConfigStoreName, (state) => state.endpointConfigErrorsExist);

    const resourceConfigErrorsExist = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resourceConfigErrorsExist']
    >(resourceConfigStoreName, (state) => state.resourceConfigErrorsExist);

    const resetEndpointConfigState = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['resetState']
    >(endpointConfigStoreName, (state) => state.resetState);

    const endpointConfigChanged = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['stateChanged']
    >(endpointConfigStoreName, (state) => state.stateChanged);

    const resetResourceConfigState = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['resetState']
    >(resourceConfigStoreName, (state) => state.resetState);

    const resourceConfigChanged = useZustandStore<
        ResourceConfigState,
        ResourceConfigState['stateChanged']
    >(resourceConfigStoreName, (state) => state.stateChanged);

    const resetDetailsFormState = useZustandStore<
        CreateState,
        CreateState['resetState']
    >(detailsFormStoreName, (state) => state.resetState);

    const detailsFormChanged = useZustandStore<
        CreateState,
        CreateState['stateChanged']
    >(detailsFormStoreName, (state) => state.stateChanged);

    // Form State
    const setFormState = useZustandStore<
        CreateState,
        CreateState['setFormState']
    >(detailsFormStoreName, (state) => state.setFormState);

    const exitWhenLogsClose = useZustandStore<
        CreateState,
        CreateState['formState']['exitWhenLogsClose']
    >(detailsFormStoreName, (state) => state.formState.exitWhenLogsClose);

    // Editor state
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >(draftEditorStoreName, (state) => state.setId);

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetEndpointConfigState();
        resetResourceConfigState();
        resetDetailsFormState();
    };

    const helpers = {
        callFailed: (formState: any, subscription?: RealtimeSubscription) => {
            const setFailureState = () => {
                setFormState({
                    status: FormStatus.FAILED,
                    exitWhenLogsClose: false,
                    ...formState,
                });
            };

            if (subscription) {
                supabaseClient
                    .removeSubscription(subscription)
                    .then(() => {
                        setFailureState();
                    })
                    .catch(() => {});
            } else {
                setFailureState();
            }
        },
        exit: () => {
            resetState();

            navigate(authenticatedRoutes.materializations.path);
        },
        jobFailed: (errorTitle: string) => {
            setFormState({
                error: {
                    title: errorTitle,
                },
                status: FormStatus.FAILED,
            });
        },
    };

    // Form Event Handlers
    const handlers = {
        closeLogs: () => {
            setFormState({
                showLogs: false,
            });

            if (exitWhenLogsClose) {
                helpers.exit();
            }
        },
    };

    usePrompt(
        'confirm.loseData',
        !exitWhenLogsClose &&
            (endpointConfigChanged() ||
                resourceConfigChanged() ||
                detailsFormChanged()),
        () => {
            resetState();
        }
    );

    return (
        <PageContainer>
            <EntityCreate
                title="browserTitle.materializationCreate"
                connectorType={connectorType}
                showCollections
                Header={
                    <FooHeader
                        GenerateButton={
                            <MaterializeGenerateButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                draftEditorStoreName={draftEditorStoreName}
                                endpointConfigStoreName={
                                    endpointConfigStoreName
                                }
                                resourceConfigStoreName={
                                    resourceConfigStoreName
                                }
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        }
                        TestButton={
                            <EntityTestButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                closeLogs={handlers.closeLogs}
                                logEvent={CustomEvents.MATERIALIZATION_TEST}
                                draftEditorStoreName={draftEditorStoreName}
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        }
                        SaveButton={
                            <EntitySaveButton
                                disabled={!draftId}
                                callFailed={helpers.callFailed}
                                closeLogs={handlers.closeLogs}
                                logEvent={CustomEvents.MATERIALIZATION_CREATE}
                                draftEditorStoreName={draftEditorStoreName}
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        }
                        heading={
                            <FormattedMessage id={`${messagePrefix}.heading`} />
                        }
                        formErrorsExist={
                            detailsFormErrorsExist ||
                            endpointConfigErrorsExist ||
                            resourceConfigErrorsExist
                        }
                        endpointConfigStoreName={endpointConfigStoreName}
                        resourceConfigStoreName={resourceConfigStoreName}
                        detailsFormStoreName={detailsFormStoreName}
                    />
                }
                draftEditorStoreName={draftEditorStoreName}
                endpointConfigStoreName={endpointConfigStoreName}
                resourceConfigStoreName={resourceConfigStoreName}
                detailsFormStoreName={detailsFormStoreName}
            />
        </PageContainer>
    );
}

export default MaterializationCreate;
