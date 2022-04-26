import { Button, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import NewCaptureHeader from 'components/capture/Header';
import LogDialog from 'components/capture/LogDialog';
import NewCaptureSpec from 'components/capture/Spec';
import useCaptureCreationStore, {
    CaptureCreationFormStatus,
    CaptureCreationState,
} from 'components/capture/Store';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import PageContainer from 'components/shared/PageContainer';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useClient, useQuery, useSelect } from 'hooks/supabase-swr';
import useBrowserTitle from 'hooks/useBrowserTitle';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { MouseEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { TABLES } from 'services/supabase';
import useNotificationStore, {
    Notification,
    NotificationState,
} from 'stores/NotificationStore';
import NewCaptureEditor from '../CatalogEditor';
import NewCaptureDetails from '../DetailsForm';
import NewCaptureError from '../Error';

export interface ConnectorTag {
    connectors: {
        detail: string;
        image_name: string;
    };
    id: string;
    image_tag: string;
    protocol: string;
    title: string;
}
const CONNECTOR_TAG_QUERY = `
    id, 
    image_tag,
    protocol,
    endpoint_spec_schema->>title,
    connectors(detail, image_name)
`;
const FORM_ID = 'newCaptureForm';

// TODO (zustand) - need to get this typing to work... too many repeated types
const selectors = {
    page: {
        captureName: (state: CaptureCreationState) => state.details.data.name,
        captureImage: (state: CaptureCreationState) => state.details.data.image,
        setDetails: (state: CaptureCreationState) => state.setDetails,
        resetState: (state: CaptureCreationState) => state.resetState,
        hasChanges: (state: CaptureCreationState) => state.hasChanges,
        errors: (state: CaptureCreationState) => [
            state.details.errors,
            state.spec.errors,
        ],
        specFormData: (state: CaptureCreationState) => state.spec.data,
        connectors: (state: CaptureCreationState) => state.connectors,
    },
    form: {
        set: (state: CaptureCreationState) => state.setFormState,
        reset: (state: CaptureCreationState) => state.resetFormState,
        saveStatus: (state: CaptureCreationState) => state.formState.saveStatus,
        status: (state: CaptureCreationState) => state.formState.status,
        showLogs: (state: CaptureCreationState) => state.formState.showLogs,
        logToken: (state: CaptureCreationState) => state.formState.logToken,
        error: (state: CaptureCreationState) => state.formState.error,
        exitWhenLogsClose: (state: CaptureCreationState) =>
            state.formState.exitWhenLogsClose,
    },
    notifications: {
        showNotification: (state: NotificationState) => state.showNotification,
    },
};

const notification: Notification = {
    description: 'Your new capture is published and ready to be used.',
    severity: 'success',
    title: 'New Capture Created',
};

function CaptureCreate() {
    useBrowserTitle('browserTitle.captureCreate');
    // misc hooks
    const intl = useIntl();
    const navigate = useNavigate();
    const confirmationModalContext = useConfirmationModalContext();

    // Supabase stuff
    const supabaseClient = useClient();
    const tagsQuery = useQuery<ConnectorTag>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_TAG_QUERY,
            filter: (query) => query.eq('protocol', 'capture'),
        },
        []
    );
    const { data: connectorTags, error: connectorTagsError } =
        useSelect(tagsQuery);
    const hasConnectors = connectorTags && connectorTags.data.length > 0;

    // Notification store
    const showNotification = useNotificationStore(
        selectors.notifications.showNotification
    );

    // Form store
    const captureName = useCaptureCreationStore(selectors.page.captureName);
    const captureImage = useCaptureCreationStore(selectors.page.captureImage);
    const [detailErrors, specErrors] = useCaptureCreationStore(
        selectors.page.errors
    );
    const specFormData = useCaptureCreationStore(selectors.page.specFormData);
    const resetState = useCaptureCreationStore(selectors.page.resetState);
    const hasChanges = useCaptureCreationStore(selectors.page.hasChanges);

    // Form State
    const setFormState = useCaptureCreationStore(selectors.form.set);
    const resetFormState = useCaptureCreationStore(selectors.form.reset);
    const status = useCaptureCreationStore(selectors.form.status);
    const showLogs = useCaptureCreationStore(selectors.form.showLogs);
    const logToken = useCaptureCreationStore(selectors.form.logToken);
    const formSubmitError = useCaptureCreationStore(selectors.form.error);
    const saveStatus = useCaptureCreationStore(selectors.form.saveStatus);
    const exitWhenLogsClose = useCaptureCreationStore(
        selectors.form.exitWhenLogsClose
    );

    //Editor state
    const setId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >((state) => state.setId);

    const id = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const helpers = {
        callFailed: (formState: any, subscription?: RealtimeSubscription) => {
            const setFailureState = () => {
                setFormState({
                    status: CaptureCreationFormStatus.IDLE,
                    exitWhenLogsClose: false,
                    saveStatus: intl.formatMessage({
                        id: 'captureCreation.status.failed',
                    }),
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
                .then(() => {
                    setFormState({
                        status: CaptureCreationFormStatus.IDLE,
                    });
                })
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
                saveStatus: intl.formatMessage({
                    id: 'captureCreation.status.failed',
                }),
            });
        },
    };

    const waitFor = {
        base: (query: any, success: Function, failureTitle: string) => {
            resetFormState(CaptureCreationFormStatus.TESTING);
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
            setId(null);
            return waitFor.base(
                supabaseClient.from(TABLES.DISCOVERS),
                (payload: any) => {
                    setId(payload.new.draft_id);
                },
                'captureCreation.test.failedErrorTitle'
            );
        },
        publications: () => {
            return waitFor.base(
                supabaseClient.from(TABLES.PUBLICATIONS),
                () => {
                    setFormState({
                        status: CaptureCreationFormStatus.IDLE,
                        exitWhenLogsClose: true,
                        saveStatus: intl.formatMessage({
                            id: 'captureCreation.status.success',
                        }),
                    });

                    showNotification(notification);
                },
                'captureCreation.save.failedErrorTitle'
            );
        },
    };

    // Form Event Handlers
    const handlers = {
        cancel: () => {
            if (hasChanges()) {
                confirmationModalContext
                    ?.showConfirmation({
                        message: 'confirm.loseData',
                    })
                    .then((confirmed) => {
                        if (confirmed) {
                            helpers.exit();
                        }
                    })
                    .catch(() => {});
            } else {
                helpers.exit();
            }
        },

        closeLogs: () => {
            setFormState({
                showLogs: false,
            });

            if (exitWhenLogsClose) {
                helpers.exit();
            }
        },

        saveAndPublish: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const publicationsSubscription = waitFor.publications();
            supabaseClient
                .from(TABLES.PUBLICATIONS)
                .insert([
                    {
                        draft_id: id,
                        dry_run: false,
                    },
                ])
                .then(
                    async (response) => {
                        if (response.data) {
                            if (response.data.length > 0) {
                                setFormState({
                                    logToken: response.data[0].logs_token,
                                    showLogs: true,
                                });
                            }
                        } else {
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
                    },
                    () => {
                        helpers.callFailed(
                            {
                                error: {
                                    title: 'captureCreation.save.serverUnreachable',
                                },
                                saveStatus: intl.formatMessage({
                                    id: 'captureCreation.status.failed',
                                }),
                            },
                            publicationsSubscription
                        );
                    }
                );
        },

        test: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            let detailHasErrors = false;
            let specHasErrors = false;

            // TODO (linting) - this was to make TS/Linting happy
            detailHasErrors = detailErrors ? detailErrors.length > 0 : false;
            specHasErrors = specErrors ? specErrors.length > 0 : false;

            if (detailHasErrors || specHasErrors) {
                setFormState({
                    showValidation: true,
                });
            } else {
                supabaseClient
                    .from(TABLES.DRAFTS)
                    .insert({
                        detail: captureName,
                    })
                    .then(
                        (draftsResponse) => {
                            if (
                                draftsResponse.data &&
                                draftsResponse.data.length > 0
                            ) {
                                const discoversSubscription =
                                    waitFor.discovers();
                                supabaseClient
                                    .from(TABLES.DISCOVERS)
                                    .insert([
                                        {
                                            capture_name: captureName,
                                            endpoint_config: specFormData,
                                            connector_tag_id: captureImage,
                                            draft_id: draftsResponse.data[0].id,
                                        },
                                    ])
                                    .then(
                                        (response) => {
                                            if (response.data) {
                                                setFormState({
                                                    logToken:
                                                        response.data[0]
                                                            .logs_token,
                                                });
                                            } else {
                                                helpers.callFailed(
                                                    {
                                                        error: {
                                                            title: 'captureCreation.test.failedErrorTitle',
                                                            error: response.error,
                                                        },
                                                    },
                                                    discoversSubscription
                                                );
                                            }
                                        },
                                        () => {
                                            helpers.callFailed(
                                                {
                                                    error: {
                                                        title: 'captureCreation.test.serverUnreachable',
                                                    },
                                                },
                                                discoversSubscription
                                            );
                                        }
                                    );
                            } else if (draftsResponse.error) {
                                helpers.callFailed({
                                    error: {
                                        title: 'captureCreation.test.failedErrorTitle',
                                        error: draftsResponse.error,
                                    },
                                });
                            }
                        },
                        () => {
                            helpers.callFailed({
                                error: {
                                    title: 'captureCreation.test.serverUnreachable',
                                },
                            });
                        }
                    );
            }
        },
    };

    return (
        <PageContainer>
            <LogDialog
                open={showLogs}
                token={logToken}
                title={intl.formatMessage({
                    id: 'captureCreation.save.waitMessage',
                })}
                actionComponent={
                    <>
                        {saveStatus}
                        <Button
                            disabled={status !== CaptureCreationFormStatus.IDLE}
                            onClick={handlers.closeLogs}
                        >
                            <FormattedMessage id="cta.close" />
                        </Button>
                    </>
                }
            />

            <NewCaptureHeader
                close={handlers.cancel}
                test={handlers.test}
                testDisabled={
                    status !== CaptureCreationFormStatus.IDLE || !hasConnectors
                }
                save={handlers.saveAndPublish}
                saveDisabled={status !== CaptureCreationFormStatus.IDLE || !id}
                formId={FORM_ID}
            />

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : (
                <>
                    <Collapse in={formSubmitError !== null}>
                        {formSubmitError && (
                            <NewCaptureError
                                title={formSubmitError.title}
                                error={formSubmitError.error}
                                logToken={logToken}
                            />
                        )}
                    </Collapse>

                    <form id={FORM_ID}>
                        {connectorTags ? (
                            <ErrorBoundryWrapper>
                                <NewCaptureDetails
                                    connectorTags={connectorTags.data}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {captureImage ? (
                            <ErrorBoundryWrapper>
                                <NewCaptureSpec connectorImage={captureImage} />
                            </ErrorBoundryWrapper>
                        ) : null}
                    </form>

                    <ErrorBoundryWrapper>
                        <NewCaptureEditor />
                    </ErrorBoundryWrapper>
                </>
            )}
        </PageContainer>
    );
}

export default CaptureCreate;
