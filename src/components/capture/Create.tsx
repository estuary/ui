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
import { DetailsFormState, FormStatus } from 'stores/DetailsForm';
import { EndpointConfigState } from 'stores/EndpointConfig';
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
    const detailsFormStoreName = DetailsFormStoreNames.CAPTURE_CREATE;

    const useEntityCreateStore = useRouteStore();
    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    const imageTag = useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']
    >(detailsFormStoreName, (state) => state.details.data.connectorImage);

    const setFormState = useZustandStore<
        DetailsFormState,
        DetailsFormState['setFormState']
    >(detailsFormStoreName, (state) => state.setFormState);

    const detailsFormChanged = useZustandStore<
        DetailsFormState,
        DetailsFormState['stateChanged']
    >(detailsFormStoreName, (state) => state.stateChanged);

    const resetDetailsFormState = useZustandStore<
        DetailsFormState,
        DetailsFormState['resetState']
    >(detailsFormStoreName, (state) => state.resetState);

    const exitWhenLogsClose = useZustandStore<
        DetailsFormState,
        DetailsFormState['formState']['exitWhenLogsClose']
    >(detailsFormStoreName, (state) => state.formState.exitWhenLogsClose);

    const resetEndpointConfigState = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['resetState']
    >(EndpointConfigStoreNames.CAPTURE_CREATE, (state) => state.resetState);

    const endpointConfigChanged = useZustandStore<
        EndpointConfigState,
        EndpointConfigState['stateChanged']
    >(EndpointConfigStoreNames.CAPTURE_CREATE, (state) => state.stateChanged);

    //Editor state
    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >(DraftEditorStoreNames.CAPTURE, (state) => state.setId);

    const pubId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['pubId']
    >(DraftEditorStoreNames.CAPTURE, (state) => state.pubId);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(DraftEditorStoreNames.CAPTURE, (state) => state.id);

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
                        GenerateButton={
                            <CaptureGenerateButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                subscription={discoversSubscription}
                                draftEditorStoreName={
                                    DraftEditorStoreNames.CAPTURE
                                }
                                endpointConfigStoreName={
                                    EndpointConfigStoreNames.CAPTURE_CREATE
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
                                draftEditorStoreName={
                                    DraftEditorStoreNames.CAPTURE
                                }
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        }
                        SaveButton={
                            <EntitySaveButton
                                closeLogs={handlers.closeLogs}
                                callFailed={helpers.callFailed}
                                disabled={!draftId}
                                draftEditorStoreName={
                                    DraftEditorStoreNames.CAPTURE
                                }
                                materialize={handlers.materializeCollections}
                                logEvent={CustomEvents.CAPTURE_CREATE}
                                detailsFormStoreName={detailsFormStoreName}
                            />
                        }
                        endpointConfigStoreName={
                            EndpointConfigStoreNames.CAPTURE_CREATE
                        }
                        detailsFormStoreName={detailsFormStoreName}
                    />
                }
                draftEditorStoreName={DraftEditorStoreNames.CAPTURE}
                endpointConfigStoreName={
                    EndpointConfigStoreNames.CAPTURE_CREATE
                }
                detailsFormStoreName={detailsFormStoreName}
            />
        </PageContainer>
    );
}

export default CaptureCreate;
