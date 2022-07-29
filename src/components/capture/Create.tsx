import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import { EditorStoreState } from 'components/editor/Store';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import FooHeader from 'components/shared/Entity/Header';
import PageContainer from 'components/shared/PageContainer';
import {
    DetailsFormStoreNames,
    DraftEditorStoreNames,
    EndpointConfigStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { useClient } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import LogRocket from 'logrocket';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import { startSubscription, TABLES } from 'services/supabase';
import { entityCreateStoreSelectors } from 'stores/Create';
import { EndpointConfigState } from 'stores/EndpointConfig';
import { CreateState, FormStatus } from 'stores/MiniCreate';
import { getPathWithParam } from 'utils/misc-utils';

const connectorType = 'capture';

const trackEvent = (payload: any) => {
    LogRocket.track(CustomEvents.CAPTURE_DISCOVER, {
        name: payload.capture_name,
        id: payload.id,
        draft_id: payload.draft_id,
        logs_token: payload.logs_token,
        status: payload.job_status.type,
    });
};

function CaptureCreate() {
    const navigate = useNavigate();

    // Supabase stuff
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorWithTagDetail(connectorType);
    const hasConnectors = connectorTags.length > 0;

    // Form store
    const draftEditorStoreName = DraftEditorStoreNames.CAPTURE;
    const detailsFormStoreName = DetailsFormStoreNames.CAPTURE_CREATE;
    const endpointConfigStoreName = EndpointConfigStoreNames.CAPTURE_CREATE;

    const useEntityCreateStore = useRouteStore();
    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const imageTag = useZustandStore<
        CreateState,
        CreateState['details']['data']['connectorImage']
    >(detailsFormStoreName, (state) => state.details.data.connectorImage);

    const setFormState = useZustandStore<
        CreateState,
        CreateState['setFormState']
    >(detailsFormStoreName, (state) => state.setFormState);

    const detailsFormChanged = useZustandStore<
        CreateState,
        CreateState['stateChanged']
    >(detailsFormStoreName, (state) => state.stateChanged);

    const resetDetailsFormState = useZustandStore<
        CreateState,
        CreateState['resetState']
    >(detailsFormStoreName, (state) => state.resetState);

    const exitWhenLogsClose = useZustandStore<
        CreateState,
        CreateState['formState']['exitWhenLogsClose']
    >(detailsFormStoreName, (state) => state.formState.exitWhenLogsClose);

    const detailsFormErrorsExist = useZustandStore<
        CreateState,
        CreateState['detailsFormErrorsExist']
    >(detailsFormStoreName, (state) => state.detailsFormErrorsExist);

    const endpointConfigErrorsExist = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['endpointConfigErrorsExist']
    >(endpointConfigStoreName, (state) => state.endpointConfigErrorsExist);

    const resetEndpointConfigState = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['resetState']
    >(endpointConfigStoreName, (state) => state.resetState);

    const endpointConfigChanged = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['stateChanged']
    >(endpointConfigStoreName, (state) => state.stateChanged);

    //Editor state
    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >(draftEditorStoreName, (state) => state.setId);

    const pubId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['pubId']
    >(draftEditorStoreName, (state) => state.pubId);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(draftEditorStoreName, (state) => state.id);

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetEndpointConfigState();
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

            navigate(authenticatedRoutes.captures.path);
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

        materializeCollections: () => {
            helpers.exit();
            navigate(
                getPathWithParam(
                    authenticatedRoutes.materializations.create.fullPath,
                    authenticatedRoutes.materializations.create.params
                        .lastPubId,
                    pubId
                )
            );
        },
    };

    const discoversSubscription = (discoverDraftId: string) => {
        setDraftId(null);
        return startSubscription(
            supabaseClient.from(
                `${TABLES.DISCOVERS}:draft_id=eq.${discoverDraftId}`
            ),
            (payload: any) => {
                setDraftId(payload.draft_id);
                setFormState({
                    status: FormStatus.GENERATED,
                });
                trackEvent(payload);
            },
            (payload: any) => {
                helpers.jobFailed(`${messagePrefix}.test.failedErrorTitle`);
                trackEvent(payload);
            }
        );
    };

    usePrompt(
        'confirm.loseData',
        !exitWhenLogsClose && (detailsFormChanged() || endpointConfigChanged()),
        () => {
            resetState();
        }
    );

    return (
        <PageContainer>
            <EntityCreate
                title="browserTitle.captureCreate"
                connectorType={connectorType}
                Header={
                    <FooHeader
                        heading={
                            <FormattedMessage id={`${messagePrefix}.heading`} />
                        }
                        formErrorsExist={
                            detailsFormErrorsExist || endpointConfigErrorsExist
                        }
                        GenerateButton={
                            <CaptureGenerateButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                subscription={discoversSubscription}
                                draftEditorStoreName={draftEditorStoreName}
                                endpointConfigStoreName={
                                    endpointConfigStoreName
                                }
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        }
                        TestButton={
                            <EntityTestButton
                                closeLogs={handlers.closeLogs}
                                callFailed={helpers.callFailed}
                                disabled={!hasConnectors}
                                logEvent={CustomEvents.CAPTURE_TEST}
                                draftEditorStoreName={draftEditorStoreName}
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        }
                        SaveButton={
                            <EntitySaveButton
                                closeLogs={handlers.closeLogs}
                                callFailed={helpers.callFailed}
                                disabled={!draftId}
                                draftEditorStoreName={draftEditorStoreName}
                                materialize={handlers.materializeCollections}
                                logEvent={CustomEvents.CAPTURE_CREATE}
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        }
                        endpointConfigStoreName={endpointConfigStoreName}
                        detailsFormStoreName={detailsFormStoreName}
                    />
                }
                draftEditorStoreName={draftEditorStoreName}
                endpointConfigStoreName={endpointConfigStoreName}
                detailsFormStoreName={detailsFormStoreName}
            />
        </PageContainer>
    );
}

export default CaptureCreate;
