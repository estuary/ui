import { Button, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import NewCaptureHeader from 'components/capture/create/Header';
import LogDialog from 'components/capture/create/LogDialog';
import NewCaptureSpec from 'components/capture/create/Spec';
import useCaptureCreationStore, {
    CaptureCreationFormStatus,
    CaptureCreationState,
} from 'components/capture/create/Store';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import PageContainer from 'components/shared/PageContainer';
import { useConfirmationModalContext } from 'context/Confirmation';
import produce from 'immer';
import { MouseEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES } from 'services/supabase';
import { ChangeSetState } from 'stores/ChangeSetStore';
import useNotificationStore, {
    Notification,
    NotificationState,
} from 'stores/NotificationStore';
import useSchemaEditorStore, {
    SchemaEditorState,
} from 'stores/SchemaEditorStore';
import { useQuery, useSelect } from 'supabase-swr';
import NewCaptureEditor from './CatalogEditor';
import NewCaptureDetails from './DetailsForm';
import NewCaptureError from './Error';

export interface ConnectorTag {
    connectors: {
        detail: string;
        image_name: string;
    };
    id: string;
    image_tag: string;
    protocol: string;
}
const CONNECTOR_TAG_QUERY = `
    id, 
    image_tag,
    protocol,
    connectors(detail, image_name)
`;
const FORM_ID = 'newCaptureForm';

// TODO - need to get this styping to work... too many repeated types
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
    changeSet: {
        addCapture: (state: ChangeSetState) => state.addCapture,
    },
    schema: {
        clearResources: (state: SchemaEditorState) => state.clearResources,
        resources: (state: SchemaEditorState) => state.resources,
    },
    notifications: {
        showNotification: (state: NotificationState) => state.showNotification,
    },
};

function CaptureCreation() {
    const intl = useIntl();
    const navigate = useNavigate();
    const confirmationModalContext = useConfirmationModalContext();

    const tagsQuery = useQuery<ConnectorTag>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_TAG_QUERY,
            filter: (query) => query.eq('protocol', 'capture'),
        },
        []
    );
    const { data: connectorTags } = useSelect(tagsQuery, {});
    const hasConnectors = connectorTags && connectorTags.data.length > 0;

    // Schema editor store
    const resourcesFromEditor = useSchemaEditorStore(
        selectors.schema.resources
    );
    const clearResourcesFromEditor = useSchemaEditorStore(
        selectors.schema.clearResources
    );

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

    // Local state
    const [catalogResponse, setCatalogResponse] = useState<any | null>(null);

    const cleanUpEditor = () => {
        if (Object.keys(resourcesFromEditor).length > 0) {
            clearResourcesFromEditor();
        }
    };

    const exit = () => {
        cleanUpEditor();

        resetState();

        navigate('/captures');
    };

    const discovers = {
        done: (discoversSubscription: RealtimeSubscription) => {
            return supabase
                .removeSubscription(discoversSubscription)
                .then(() => {
                    setFormState({
                        status: CaptureCreationFormStatus.IDLE,
                    });
                })
                .catch(() => {});
        },
        waitForFinish: () => {
            cleanUpEditor();
            resetFormState(CaptureCreationFormStatus.TESTING);
            const discoverStatus = supabase
                .from(TABLES.DISCOVERS)
                .on('*', async (payload) => {
                    if (payload.new.job_status.type !== 'queued') {
                        if (payload.new.job_status.type === 'success') {
                            setCatalogResponse(payload.new.catalog_spec);
                        } else {
                            setFormState({
                                error: {
                                    title: 'captureCreation.test.failedErrorTitle',
                                },
                                saveStatus: intl.formatMessage({
                                    id: 'captureCreation.status.failed',
                                }),
                            });
                        }

                        await discovers.done(discoverStatus);
                    }
                })
                .subscribe();

            return discoverStatus;
        },
    };

    const drafts = {
        done: (draftsSubscription: RealtimeSubscription) => {
            return supabase
                .removeSubscription(draftsSubscription)
                .then(() => {
                    setFormState({
                        status: CaptureCreationFormStatus.IDLE,
                    });
                })
                .catch(() => {});
        },
        waitForFinish: () => {
            cleanUpEditor();
            resetFormState(CaptureCreationFormStatus.SAVING);
            const draftsSubscription = supabase
                .from(TABLES.DRAFTS)
                .on('*', async (payload) => {
                    if (payload.new.job_status.type !== 'queued') {
                        if (payload.new.job_status.type === 'success') {
                            setFormState({
                                status: CaptureCreationFormStatus.IDLE,
                                exitWhenLogsClose: true,
                                saveStatus: intl.formatMessage({
                                    id: 'captureCreation.status.success',
                                }),
                            });
                            const notification: Notification = {
                                description:
                                    'Your new capture is published and ready to be used.',
                                severity: 'success',
                                title: 'New Capture Created',
                            };
                            showNotification(notification);
                        } else {
                            setFormState({
                                error: {
                                    title: 'captureCreation.save.failedErrorTitle',
                                },
                                saveStatus: intl.formatMessage({
                                    id: 'captureCreation.status.failed',
                                }),
                            });
                        }

                        await drafts.done(draftsSubscription);
                    }
                })
                .subscribe();

            return draftsSubscription;
        },
    };

    const prepareCatalogForSaving = () => {
        const editorKeys = Object.keys(resourcesFromEditor);

        if (editorKeys.length > 0) {
            return produce(catalogResponse, (draft: any) => {
                editorKeys.forEach((key) => {
                    draft.resources[key].content = resourcesFromEditor[key];
                });
            });
        } else {
            return catalogResponse;
        }
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
                            exit();
                        }
                    })
                    .catch(() => {});
            } else {
                exit();
            }
        },

        closeLogs: () => {
            setFormState({
                showLogs: false,
            });

            if (exitWhenLogsClose) {
                exit();
            }
        },

        saveAndPublish: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const draftsSubscription = drafts.waitForFinish();
            supabase
                .from(TABLES.DRAFTS)
                .insert([
                    {
                        catalog_spec: prepareCatalogForSaving(),
                    },
                ])
                .then(
                    async (response) => {
                        if (response.data) {
                            // TODO Need to use this response as part of the subscribe somehow
                            if (response.data.length > 0) {
                                setFormState({
                                    logToken: response.data[0].logs_token,
                                    showLogs: true,
                                });
                            }
                        } else {
                            drafts
                                .done(draftsSubscription)
                                .then(() => {
                                    setFormState({
                                        status: CaptureCreationFormStatus.IDLE,
                                        exitWhenLogsClose: false,
                                        error: {
                                            title: 'captureCreation.save.failedErrorTitle',
                                            error: response.error,
                                        },
                                        saveStatus: intl.formatMessage({
                                            id: 'captureCreation.status.failed',
                                        }),
                                    });
                                })
                                .catch(() => {});
                        }
                    },
                    () => {
                        setFormState({
                            status: CaptureCreationFormStatus.IDLE,
                            saveStatus: intl.formatMessage({
                                id: 'captureCreation.status.failed',
                            }),
                            error: {
                                title: 'captureCreation.save.failedErrorTitle',
                            },
                        });
                    }
                );
        },

        test: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            let detailHasErrors = false;
            let specHasErrors = false;

            // TODO - this was to make TS/Linting happy
            detailHasErrors = detailErrors ? detailErrors.length > 0 : false;
            specHasErrors = specErrors ? specErrors.length > 0 : false;

            if (detailHasErrors || specHasErrors) {
                setFormState({
                    showValidation: true,
                });
            } else {
                // TODO (supabase) - `discovers:id=eq.${response.data[0].id}` was not working
                const discoversSubscription = discovers.waitForFinish();
                supabase
                    .from(TABLES.DISCOVERS)
                    .insert([
                        {
                            capture_name: captureName,
                            endpoint_config: specFormData,
                            connector_tag_id: captureImage,
                        },
                    ])
                    .then(
                        (response) => {
                            if (response.data) {
                                setFormState({
                                    logToken: response.data[0].logs_token,
                                });
                            } else {
                                discovers
                                    .done(discoversSubscription)
                                    .then(() => {
                                        setFormState({
                                            status: CaptureCreationFormStatus.IDLE,
                                            exitWhenLogsClose: false,
                                            error: {
                                                title: 'captureCreation.test.failedErrorTitle',
                                                error: response.error,
                                            },
                                            saveStatus: intl.formatMessage({
                                                id: 'captureCreation.status.failed',
                                            }),
                                        });
                                    })
                                    .catch(() => {});
                            }
                        },
                        () => {
                            setFormState({
                                error: {
                                    title: 'captureCreation.test.failedErrorTitle',
                                },
                            });
                            discovers
                                .done(discoversSubscription)
                                .then(() => {})
                                .catch(() => {});
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
                saveDisabled={
                    status !== CaptureCreationFormStatus.IDLE ||
                    !catalogResponse
                }
                formId={FORM_ID}
            />

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
                        <NewCaptureDetails connectorTags={connectorTags.data} />
                    </ErrorBoundryWrapper>
                ) : null}

                {captureImage ? (
                    <ErrorBoundryWrapper>
                        <NewCaptureSpec connectorImage={captureImage} />
                    </ErrorBoundryWrapper>
                ) : null}
            </form>

            <ErrorBoundryWrapper>
                {catalogResponse ? (
                    <NewCaptureEditor data={catalogResponse} />
                ) : null}
            </ErrorBoundryWrapper>
        </PageContainer>
    );
}

export default CaptureCreation;
