import { Button, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import FooHeader from 'components/shared/Entity/Header';
import LogDialog from 'components/shared/Entity/LogDialog';
import {
    ConnectorTag,
    CONNECTOR_TAG_QUERY,
} from 'components/shared/Entity/query';
import useEntityStore, {
    fooSelectors,
    FormStatus,
} from 'components/shared/Entity/Store';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import PageContainer from 'components/shared/PageContainer';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useClient, useQuery, useSelect } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useZustandStore } from 'hooks/useZustand';
import { MouseEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { TABLES } from 'services/supabase';
import useNotificationStore, {
    Notification,
    NotificationState,
} from 'stores/NotificationStore';

const FORM_ID = 'newCaptureForm';

const selectors = {
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
    const { combinedGrants } = useCombinedGrantsExt();

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
    const resetState = useEntityStore(fooSelectors.resetState);
    const entityName = useEntityStore(fooSelectors.entityName);
    const imageTag = useEntityStore(fooSelectors.connectorTag);
    const entityDescription = useEntityStore(fooSelectors.description);
    const [detailErrors, specErrors] = useEntityStore(fooSelectors.errors);
    const specFormData = useEntityStore(fooSelectors.endpointConfig);
    const hasChanges = useEntityStore(fooSelectors.hasChanges);

    // Form State
    const setFormState = useEntityStore(fooSelectors.setFormState);
    const resetFormState = useEntityStore(fooSelectors.resetFormState);
    const formStateStatus = useEntityStore(fooSelectors.formStateStatus);
    const showLogs = useEntityStore(fooSelectors.showLogs);
    const logToken = useEntityStore(fooSelectors.logToken);
    const formSubmitError = useEntityStore(fooSelectors.error);
    const formStateSaveStatus = useEntityStore(
        fooSelectors.formStateSaveStatus
    );
    const exitWhenLogsClose = useEntityStore(fooSelectors.exitWhenLogsClose);

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
                    status: FormStatus.IDLE,
                    exitWhenLogsClose: false,
                    saveStatus: intl.formatMessage({
                        id: 'common.fail',
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
                        status: FormStatus.IDLE,
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
                    id: 'common.fail',
                }),
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
                        status: FormStatus.IDLE,
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
                        detail: entityDescription ?? null,
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
                                    id: 'common.fail',
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
                    displayValidation: true,
                });
            } else {
                supabaseClient
                    .from(TABLES.DRAFTS)
                    .insert({
                        detail: entityName,
                    })
                    .then(
                        (draftsResponse) => {
                            if (
                                imageTag &&
                                draftsResponse.data &&
                                draftsResponse.data.length > 0
                            ) {
                                const discoversSubscription =
                                    waitFor.discovers();
                                supabaseClient
                                    .from(TABLES.DISCOVERS)
                                    .insert([
                                        {
                                            capture_name: entityName,
                                            endpoint_config: specFormData,
                                            connector_tag_id: imageTag.id,
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

    usePrompt('confirm.loseData', !exitWhenLogsClose && hasChanges(), () => {
        resetState();
    });

    return (
        <PageContainer>
            <LogDialog
                open={showLogs}
                token={logToken}
                title={
                    <FormattedMessage id="captureCreation.save.waitMessage" />
                }
                actionComponent={
                    <>
                        {formStateSaveStatus}
                        <Button
                            disabled={formStateStatus !== FormStatus.IDLE}
                            onClick={handlers.closeLogs}
                        >
                            <FormattedMessage id="cta.close" />
                        </Button>
                    </>
                }
            />

            <FooHeader
                close={handlers.cancel}
                test={handlers.test}
                testDisabled={
                    formStateStatus !== FormStatus.IDLE || !hasConnectors
                }
                save={handlers.saveAndPublish}
                saveDisabled={formStateStatus !== FormStatus.IDLE || !id}
                formId={FORM_ID}
                heading={<FormattedMessage id="captureCreation.heading" />}
            />

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : (
                <>
                    <Collapse in={formSubmitError !== null}>
                        {formSubmitError && (
                            <EntityError
                                title={formSubmitError.title}
                                error={formSubmitError.error}
                                logToken={logToken}
                                draftId={id}
                            />
                        )}
                    </Collapse>

                    <form id={FORM_ID}>
                        {connectorTags ? (
                            <ErrorBoundryWrapper>
                                <DetailsForm
                                    connectorTags={connectorTags.data}
                                    messagePrefix="captureCreation"
                                    accessGrants={combinedGrants}
                                />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {imageTag?.id ? (
                            <ErrorBoundryWrapper>
                                <EndpointConfig connectorImage={imageTag.id} />
                            </ErrorBoundryWrapper>
                        ) : null}
                    </form>

                    <ErrorBoundryWrapper>
                        <CatalogEditor messageId="captureCreation.finalReview.instructions" />
                    </ErrorBoundryWrapper>
                </>
            )}
        </PageContainer>
    );
}

export default CaptureCreate;
