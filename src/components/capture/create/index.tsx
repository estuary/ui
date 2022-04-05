import { Button } from '@mui/material';
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
import { MouseEvent, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { supabase, Tables } from 'services/supabase';
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

const FORM_ID = 'newCaptureForm';

const selectors = {
    addCapture: (state: ChangeSetState) => state.addCapture,
    clearResources: (state: SchemaEditorState) => state.clearResources,
    resources: (state: SchemaEditorState) => state.resources,
    showNotification: (state: NotificationState) => state.showNotification,
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
    formState: {
        set: (state: CaptureCreationState) => state.setFormState,
        saveStatus: (state: CaptureCreationState) => state.formState.saveStatus,
        status: (state: CaptureCreationState) => state.formState.status,
        showLogs: (state: CaptureCreationState) => state.formState.showLogs,
    },
};

interface ConnectorTag {
    connectors: {
        detail: string;
        image_name: string;
    };
    id: string;
    image_tag: string;
    protocol: string;
}

function CaptureCreation() {
    const intl = useIntl();
    const navigate = useNavigate();
    const confirmationModalContext = useConfirmationModalContext();

    const tagsQuery = useQuery<ConnectorTag>(
        Tables.CONNECTOR_TAGS,
        {
            columns: `
                id, 
                image_tag,
                protocol,
                connectors(detail, image_name)
            `,
            filter: (query) => query.eq('protocol', 'capture'),
        },
        []
    );
    const { data: connectorTags } = useSelect(tagsQuery, {});
    const hasConnectors = connectorTags && connectorTags.data.length > 0;

    // Schema editor store
    const resourcesFromEditor = useSchemaEditorStore(selectors.resources);
    const clearResourcesFromEditor = useSchemaEditorStore(
        selectors.clearResources
    );

    // Notification store
    const showNotification = useNotificationStore(selectors.showNotification);

    // Form store
    const captureName = useCaptureCreationStore(selectors.captureName);
    const captureImage = useCaptureCreationStore(selectors.captureImage);
    const [detailErrors, specErrors] = useCaptureCreationStore(
        selectors.errors
    );
    const specFormData = useCaptureCreationStore(selectors.specFormData);
    const resetState = useCaptureCreationStore(selectors.resetState);
    const hasChanges = useCaptureCreationStore(selectors.hasChanges);

    // Form State
    const setFormState = useCaptureCreationStore(selectors.formState.set);
    const status = useCaptureCreationStore(selectors.formState.status);
    const showLogs = useCaptureCreationStore(selectors.formState.showLogs);
    const saveStatus = useCaptureCreationStore(selectors.formState.saveStatus);

    const [formSubmitError, setFormSubmitError] = useState<{
        message: string;
        errors: any[];
    } | null>(null);
    const [catalogResponse, setCatalogResponse] = useState<any | null>(null);

    const exit = () => {
        if (Object.keys(resourcesFromEditor).length > 0) {
            clearResourcesFromEditor();
        }

        resetState();

        navigate('/captures');
    };

    const [logToken, setLogToken] = useState<string | null>(null);

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
            const discoverStatus = supabase
                .from(`discovers`)
                .on('UPDATE', async (payload) => {
                    setCatalogResponse(payload.new.catalog_spec);
                    await discovers.done(discoverStatus);
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
                    setLogToken(null);
                    setFormState({
                        status: CaptureCreationFormStatus.IDLE,
                    });
                })
                .catch(() => {});
        },
        waitForFinish: () => {
            const draftsSubscription = supabase
                .from(`drafts`)
                .on('UPDATE', async () => {
                    setFormState({
                        status: CaptureCreationFormStatus.IDLE,
                        saveStatus: 'Success!',
                    });
                    const notification: Notification = {
                        description:
                            'Your new capture is published and ready to be used.',
                        severity: 'success',
                        title: 'New Capture Created',
                    };
                    showNotification(notification);

                    await drafts.done(draftsSubscription);
                })
                .subscribe();

            return draftsSubscription;
        },
    };

    // Form Event Handlers
    const handlers = {
        saveAndPublish: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            setFormState({
                status: CaptureCreationFormStatus.SAVING,
                saveStatus: 'running...',
            });

            const draftsSubscription = drafts.waitForFinish();
            supabase
                .from('drafts')
                .insert([
                    {
                        catalog_spec: catalogResponse,
                    },
                ])
                .then(
                    async (response) => {
                        if (response.data) {
                            // TODO Need to use this response as part of the subscribe somehow?
                            if (response.data.length > 0) {
                                setFormState({
                                    showLogs: true,
                                });
                                setLogToken(response.data[0].logs_token);
                            }
                        } else {
                            // setFormSubmitError({
                            //     message: 'Failed to create your discover',
                            // });
                            drafts
                                .done(draftsSubscription)
                                .then(() => {
                                    setFormState({
                                        status: CaptureCreationFormStatus.IDLE,
                                        saveStatus: 'Failed',
                                    });
                                })
                                .catch(() => {});
                        }
                    },
                    (draftsError) => {
                        setFormSubmitError(draftsError);
                        setFormState({
                            status: CaptureCreationFormStatus.IDLE,
                            saveStatus: 'Failed',
                        });
                    }
                );
        },

        close: () => {
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
                setFormState({
                    status: CaptureCreationFormStatus.TESTING,
                    saveStatus: 'testing...',
                });

                // TODO (supabase) - `discovers:id=eq.${response.data[0].id}` was not working
                const discoversSubscription = discovers.waitForFinish();
                supabase
                    .from('discovers')
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
                                console.log(response.data[0].logs_token);
                            } else {
                                discovers
                                    .done(discoversSubscription)
                                    .then(() => {})
                                    .catch(() => {});
                            }
                        },
                        (discoversError) => {
                            setFormSubmitError(discoversError);
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
                            onClick={exit}
                        >
                            Close
                        </Button>
                    </>
                }
            />

            <NewCaptureHeader
                close={handlers.close}
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

            {formSubmitError && (
                <NewCaptureError
                    title="captureCreation.save.failed"
                    errors={formSubmitError.errors}
                />
            )}

            <ErrorBoundryWrapper>
                <form id={FORM_ID}>
                    {connectorTags ? (
                        <NewCaptureDetails connectorTags={connectorTags.data} />
                    ) : null}

                    {captureImage ? (
                        <NewCaptureSpec connectorImage={captureImage} />
                    ) : null}
                </form>
            </ErrorBoundryWrapper>

            {catalogResponse ? (
                <NewCaptureEditor data={catalogResponse} />
            ) : null}
        </PageContainer>
    );
}

export default CaptureCreation;
