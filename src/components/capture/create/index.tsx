import { Button, Stack, Toolbar, Typography } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import LogDialog from 'components/capture/create/LogDialog';
import NewCaptureSpec from 'components/capture/create/Spec';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/create/Store';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import PageContainer from 'components/shared/PageContainer';
import { useConfirmationModalContext } from 'context/Confirmation';
import { MouseEvent, useState } from 'react';
import { FormattedMessage } from 'react-intl';
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

    // Form props
    const [showValidation, setShowValidation] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSaving, setFormSaving] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

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
            setFormSubmitting(false);
            return supabase
                .removeSubscription(discoversSubscription)
                .then(() => {})
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
                    setFormSubmitting(false);
                })
                .catch(() => {});
        },
        waitForFinish: () => {
            const draftsSubscription = supabase
                .from(`drafts`)
                .on('UPDATE', async () => {
                    setSaveStatus('Success!');
                    setFormSaving(false);
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
            setFormSubmitting(true);
            setFormSaving(true);
            setSaveStatus('running...');

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
                                setShowLogs(true);
                                setLogToken(response.data[0].logs_token);
                            }
                        } else {
                            // setFormSubmitError({
                            //     message: 'Failed to create your discover',
                            // });
                            drafts
                                .done(draftsSubscription)
                                .then(() => {
                                    setFormSubmitting(false);
                                })
                                .catch(() => {});
                        }
                    },
                    (draftsError) => {
                        setFormSubmitError(draftsError);
                        setFormSubmitting(false);
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
                setShowValidation(true);
            } else {
                setFormSubmitting(true);
                setFormSubmitError(null);

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
                                    .then(() => {
                                        setFormSubmitting(false);
                                    })
                                    .catch(() => {});
                            }
                        },
                        (discoversError) => {
                            setFormSubmitError(discoversError);
                            setFormSubmitting(false);
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
                actionComponent={
                    <>
                        {saveStatus}
                        <Button disabled={formSaving} onClick={exit}>
                            Close
                        </Button>
                    </>
                }
            />
            <Toolbar>
                <Typography variant="h6" noWrap>
                    <FormattedMessage id="captureCreation.heading" />
                </Typography>

                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{
                        ml: 'auto',
                    }}
                >
                    <Button onClick={handlers.close} color="error">
                        <FormattedMessage id="cta.cancel" />
                    </Button>

                    <Button
                        onClick={handlers.test}
                        disabled={formSubmitting || !hasConnectors}
                        form={FORM_ID}
                        type="submit"
                        color="success"
                        variant="contained"
                        disableElevation
                    >
                        <FormattedMessage id="captureCreation.ctas.discover" />
                    </Button>

                    <Button
                        onClick={handlers.saveAndPublish}
                        disabled={!catalogResponse || formSubmitting}
                        color="success"
                        variant="contained"
                        disableElevation
                    >
                        <FormattedMessage id="cta.saveEntity" />
                    </Button>
                </Stack>
            </Toolbar>

            {formSubmitError && (
                <NewCaptureError
                    title="captureCreation.save.failed"
                    errors={formSubmitError.errors}
                />
            )}

            <ErrorBoundryWrapper>
                <form id={FORM_ID}>
                    {connectorTags ? (
                        <NewCaptureDetails
                            displayValidation={showValidation}
                            readonly={formSubmitting}
                            connectorTags={connectorTags.data}
                        />
                    ) : null}

                    {captureImage ? (
                        <NewCaptureSpec
                            displayValidation={showValidation}
                            readonly={formSubmitting}
                            connectorImage={captureImage}
                        />
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
