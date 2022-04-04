import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    Toolbar,
    Typography,
} from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import NewCaptureSpec from 'components/capture/create/Spec';
import useCaptureCreationStore, {
    CaptureCreationState,
} from 'components/capture/create/Store';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import PageContainer from 'components/shared/PageContainer';
import { useConfirmationModalContext } from 'context/Confirmation';
import { MouseEvent, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { LazyLog } from 'react-lazylog';
import { useNavigate } from 'react-router-dom';
import { useInterval } from 'react-use';
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
    const [saveLogs, setSaveLogs] = useState([
        'waiting for logs...',
        '-------------------',
    ]);

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

    const [logToken, setLogToken] = useState<boolean | null>(null);
    const [logOffset, setLogOffset] = useState<number>(0);
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
                    setFormSaving(false);
                    const notification: Notification = {
                        description:
                            'Your new capture is published and ready to be used.',
                        severity: 'success',
                        title: 'New Capture Created',
                    };
                    showNotification(notification);

                    drafts
                        .done(draftsSubscription)
                        .then(() => {
                            exit();
                        })
                        .catch(() => {});
                })
                .subscribe();

            return draftsSubscription;
        },
    };

    useInterval(
        async () => {
            const { data } = await supabase
                .rpc('view_logs', {
                    bearer_token: logToken,
                })
                .range(logOffset, logOffset + 5);

            if (data && data.length > 0) {
                const logsReduced = data.map((logData) => {
                    return logData.log_line;
                });
                console.log('logsReduced', logsReduced);

                setLogOffset(data.length);
                setSaveLogs(saveLogs.concat(logsReduced));
            }
        },
        logToken ? 1000 : null
    );

    // Form Event Handlers
    const handlers = {
        saveAndPublish: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();
            setFormSubmitting(true);
            setFormSaving(true);

            supabase
                .from('drafts')
                .insert([
                    {
                        catalog_spec: catalogResponse,
                    },
                ])
                .then(
                    async (response) => {
                        const draftsSubscription = drafts.waitForFinish();

                        if (response.data) {
                            // TODO Need to use this response as part of the subscribe somehow?
                            if (response.data.length > 0) {
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
                const discoverStatus = supabase
                    .from(`discovers`)
                    .on('UPDATE', async (payload) => {
                        console.log('Change received!', payload);
                        setCatalogResponse(payload.new.catalog_spec);
                        setFormSubmitting(false);
                        await supabase.removeSubscription(discoverStatus);
                    })
                    .subscribe();

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
                                console.log('discover returned', response);
                            } else {
                                // setFormSubmitError({
                                //     message: 'Failed to create your discover',
                                // });
                                setFormSubmitting(false);
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
            <Dialog
                open={formSaving}
                maxWidth="lg"
                fullWidth
                aria-labelledby="new-capture-saving-title"
            >
                <DialogTitle id="new-capture-saving-title">
                    <FormattedMessage id="captureCreation.save.waitMessage" />
                </DialogTitle>
                <DialogContent
                    sx={{
                        height: 300,
                    }}
                >
                    <LazyLog
                        extraLines={1}
                        stream={true}
                        text={saveLogs.join('\r\n')}
                        caseInsensitive
                        follow={true}
                    />
                </DialogContent>
            </Dialog>

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
                        <>
                            <Typography variant="h5">
                                Capture Details
                            </Typography>
                            <NewCaptureDetails
                                displayValidation={showValidation}
                                readonly={formSubmitting}
                                connectorTags={connectorTags.data}
                            />
                        </>
                    ) : null}

                    {captureImage ? (
                        <>
                            <Typography variant="h5">
                                Connection Config
                            </Typography>
                            <Paper sx={{ width: '100%' }}>
                                <NewCaptureSpec
                                    displayValidation={showValidation}
                                    readonly={formSubmitting}
                                    connectorImage={captureImage}
                                />
                            </Paper>
                        </>
                    ) : null}
                </form>
            </ErrorBoundryWrapper>

            {catalogResponse ? (
                <>
                    <Typography variant="h5">Catalog Editor</Typography>
                    <NewCaptureEditor data={catalogResponse} />
                </>
            ) : null}
        </PageContainer>
    );
}

export default CaptureCreation;
