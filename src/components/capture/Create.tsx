import { RealtimeSubscription } from '@supabase/supabase-js';
import { createPublication } from 'api/publications';
import { routeDetails } from 'app/Authenticated';
import CaptureTestButton from 'components/capture/TestButton';
import { EditorStoreState } from 'components/editor/Store';
import Create from 'components/shared/Entity/Create';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import PageContainer from 'components/shared/PageContainer';
import { useClient } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { MouseEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TABLES } from 'services/supabase';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';
import useNotificationStore, {
    Notification,
    notificationStoreSelectors,
} from 'stores/NotificationStore';
import { getPathWithParam } from 'utils/misc-utils';

const FORM_ID = 'newCaptureForm';

const notification: Notification = {
    description: 'Your new capture is published and ready to be used.',
    severity: 'success',
    title: 'New Capture Created',
};

function CaptureCreate() {
    useBrowserTitle('browserTitle.captureCreate');

    // misc hooks
    const navigate = useNavigate();

    // Supabase stuff
    const supabaseClient = useClient();

    // Notification store
    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    // Form store
    const entityCreateStore = useRouteStore();
    const imageTag = entityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const entityDescription = entityCreateStore(
        entityCreateStoreSelectors.details.description
    );
    const hasChanges = entityCreateStore(entityCreateStoreSelectors.hasChanges);
    const resetState = entityCreateStore(entityCreateStoreSelectors.resetState);

    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const resetFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.reset
    );

    const exitWhenLogsClose = entityCreateStore(
        entityCreateStoreSelectors.formState.exitWhenLogsClose
    );

    //Editor state
    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >((state) => state.setId);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const pubId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['pubId']
    >((state) => state.pubId);

    const setPubId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setPubId']
    >((state) => state.setPubId);

    // Reset the cataolg if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

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
                helpers
                    .doneSubscribing(subscription)
                    .then(() => {
                        setFailureState();
                    })
                    .catch(() => {});
            } else {
                setFailureState();
            }
        },
        doneSubscribing: (subscription: RealtimeSubscription) => {
            return supabaseClient
                .removeSubscription(subscription)
                .then(() => {})
                .catch(() => {});
        },
        exit: () => {
            resetState();

            navigate(routeDetails.captures.path);
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

    const waitFor = {
        base: (query: any, success: Function, failureTitle: string) => {
            resetFormState(FormStatus.TESTING);
            const subscription = query
                .on('*', async (payload: any) => {
                    if (payload.new.job_status.type !== 'queued') {
                        if (payload.new.job_status.type === 'success') {
                            success(payload);
                        } else {
                            helpers.jobFailed(failureTitle);
                        }

                        await helpers.doneSubscribing(subscription);
                    }
                })
                .subscribe();

            return subscription;
        },
        discovers: () => {
            setDraftId(null);
            return waitFor.base(
                supabaseClient.from(TABLES.DISCOVERS),
                (payload: any) => {
                    setFormState({
                        status: FormStatus.IDLE,
                    });
                    setDraftId(payload.new.draft_id);
                },
                'captureCreation.test.failedErrorTitle'
            );
        },
        publications: () => {
            return waitFor.base(
                supabaseClient.from(TABLES.PUBLICATIONS),
                (payload: any) => {
                    setPubId(payload.new.id);
                    setFormState({
                        status: FormStatus.SUCCESS,
                        exitWhenLogsClose: true,
                    });

                    showNotification(notification);
                },
                'captureCreation.save.failedErrorTitle'
            );
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
                    routeDetails.materializations.create.fullPath,
                    routeDetails.materializations.create.params.specID,
                    pubId
                )
            );
        },

        saveAndPublish: async (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const publicationsSubscription = waitFor.publications();
            const response = await createPublication(
                draftId,
                entityDescription
            );

            if (response.error) {
                helpers.callFailed(
                    {
                        error: {
                            title: 'captureCreation.save.failedErrorTitle',
                            error: response.error,
                        },
                    },
                    publicationsSubscription
                );
            }

            setFormState({
                logToken: response.data[0].logs_token,
                showLogs: true,
            });
        },
    };

    usePrompt('confirm.loseData', !exitWhenLogsClose && hasChanges(), () => {
        resetState();
    });

    return (
        <PageContainer>
            <Create
                title="browserTitle.captureCreate"
                connectorType="capture"
                formID={FORM_ID}
                successNotification={notification}
                messagePrefix="captureCreation"
                TestButton={CaptureTestButton}
                save={handlers.saveAndPublish}
                logAction={
                    <LogDialogActions
                        close={handlers.closeLogs}
                        materialize={{
                            action: handlers.materializeCollections,
                            title: 'captureCreation.ctas.materialize',
                        }}
                    />
                }
            />
        </PageContainer>
    );
}

export default CaptureCreate;
