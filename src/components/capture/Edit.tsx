import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import { EditorStoreState } from 'components/editor/Store';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityEdit from 'components/shared/Entity/Edit';
import { useEntityType } from 'components/shared/Entity/EntityContext';
import FooHeader from 'components/shared/Entity/Header';
import PageContainer from 'components/shared/PageContainer';
import {
    DraftEditorStoreNames,
    FormStateStoreNames,
    useZustandStore,
} from 'context/Zustand';
import { useClient } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import LogRocket from 'logrocket';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import { startSubscription, TABLES } from 'services/supabase';
import {
    useDetailsForm_changed,
    useDetailsForm_connectorImage,
    useDetailsForm_errorsExist,
} from 'stores/DetailsForm';
import {
    useEndpointConfigStore_changed,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_reset,
} from 'stores/EndpointConfig';
import { EntityFormState, FormStatus } from 'stores/FormState';
import { getPathWithParam } from 'utils/misc-utils';

const draftEditorStoreName = DraftEditorStoreNames.CAPTURE;
const formStateStoreName = FormStateStoreNames.CAPTURE;

const trackEvent = (payload: any) => {
    LogRocket.track(CustomEvents.CAPTURE_DISCOVER, {
        name: payload.capture_name,
        id: payload.id,
        draft_id: payload.draft_id,
        logs_token: payload.logs_token,
        status: payload.job_status.type,
    });
};

function CaptureEdit() {
    const navigate = useNavigate();

    const entityType = useEntityType();

    // Supabase stuff
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();
    const detailsFormErrorsExist = useDetailsForm_errorsExist();
    const detailsFormChanged = useDetailsForm_changed();

    // Draft Editor Store
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

    // Endpoint Config Store
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    const resetEndpointConfigState = useEndpointConfigStore_reset();
    const endpointConfigChanged = useEndpointConfigStore_changed();

    // Form State Store
    const messagePrefix = useZustandStore<
        EntityFormState,
        EntityFormState['messagePrefix']
    >(formStateStoreName, (state) => state.messagePrefix);

    const setFormState = useZustandStore<
        EntityFormState,
        EntityFormState['setFormState']
    >(formStateStoreName, (state) => state.setFormState);

    const resetFormState = useZustandStore<
        EntityFormState,
        EntityFormState['resetState']
    >(formStateStoreName, (state) => state.resetState);

    const exitWhenLogsClose = useZustandStore<
        EntityFormState,
        EntityFormState['formState']['exitWhenLogsClose']
    >(formStateStoreName, (state) => state.formState.exitWhenLogsClose);

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetEndpointConfigState();
        resetFormState();
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
            <EntityEdit
                title="browserTitle.captureCreate"
                entityType={entityType}
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
                                formStateStoreName={formStateStoreName}
                            />
                        }
                        TestButton={
                            <EntityTestButton
                                closeLogs={handlers.closeLogs}
                                callFailed={helpers.callFailed}
                                disabled={!hasConnectors}
                                logEvent={CustomEvents.CAPTURE_TEST}
                                draftEditorStoreName={draftEditorStoreName}
                                formStateStoreName={formStateStoreName}
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
                                formStateStoreName={formStateStoreName}
                            />
                        }
                        formStateStoreName={formStateStoreName}
                    />
                }
                draftEditorStoreName={draftEditorStoreName}
                formStateStoreName={formStateStoreName}
                readOnly={{ detailsForm: true, endpointConfigForm: true }}
            />
        </PageContainer>
    );
}

export default CaptureEdit;
