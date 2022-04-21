import { Button, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import CollectionSelector from 'components/materialization/CollectionSelector';
import NewMaterializationDetails from 'components/materialization/DetailsForm';
import NewMaterializationError from 'components/materialization/Error';
import NewMaterializationHeader from 'components/materialization/Header';
import LogDialog from 'components/materialization/LogDialog';
import NewMaterializationSpec from 'components/materialization/Spec';
import useCreationStore, {
    CreationFormStatus,
    CreationState,
} from 'components/materialization/Store';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import PageContainer from 'components/shared/PageContainer';
import { useConfirmationModalContext } from 'context/Confirmation';
import { useClient, useQuery, useSelect } from 'hooks/supabase-swr';
import { MouseEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { TABLES } from 'services/supabase';
import useNotificationStore, {
    Notification,
    NotificationState,
} from 'stores/NotificationStore';
import { MaterializationDef } from '../../../../flow_deps/flow';

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
const FORM_ID = 'newMaterializationForm';

// TODO - need to get this typing to work... too many repeated types
const selectors = {
    page: {
        catalogNamespace: (state: CreationState) => state.details.data.name,
        imageTagId: (state: CreationState) => state.details.data.image,
        setDetails: (state: CreationState) => state.setDetails,
        resetState: (state: CreationState) => state.resetState,
        hasChanges: (state: CreationState) => state.hasChanges,
        errors: (state: CreationState) => [
            state.details.errors,
            state.spec.errors,
        ],
        specFormData: (state: CreationState) => state.spec.data,
        connectors: (state: CreationState) => state.connectors,
        collections: (state: CreationState) => state.collections,
    },
    form: {
        set: (state: CreationState) => state.setFormState,
        reset: (state: CreationState) => state.resetFormState,
        saveStatus: (state: CreationState) => state.formState.saveStatus,
        status: (state: CreationState) => state.formState.status,
        showLogs: (state: CreationState) => state.formState.showLogs,
        logToken: (state: CreationState) => state.formState.logToken,
        error: (state: CreationState) => state.formState.error,
        exitWhenLogsClose: (state: CreationState) =>
            state.formState.exitWhenLogsClose,
    },
    notifications: {
        showNotification: (state: NotificationState) => state.showNotification,
    },
};

const notification: Notification = {
    description: 'Your new materialization is published and ready to be used.',
    severity: 'success',
    title: 'New Materialization Created',
};

function MaterializationCreate() {
    // Misc. hooks
    const intl = useIntl();
    const navigate = useNavigate();
    const confirmationModalContext = useConfirmationModalContext();

    // Supabase
    const supabaseClient = useClient();
    const tagsQuery = useQuery<ConnectorTag>(
        TABLES.CONNECTOR_TAGS,
        {
            columns: CONNECTOR_TAG_QUERY,
            filter: (query) => query.eq('protocol', 'materialization'),
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
    const catalogNamespace = useCreationStore(selectors.page.catalogNamespace);
    const imageTagId = useCreationStore(selectors.page.imageTagId);
    const collections = useCreationStore(selectors.page.collections);
    const endpointConfig = useCreationStore(selectors.page.specFormData);
    const [detailErrors, specErrors] = useCreationStore(selectors.page.errors);
    const resetState = useCreationStore(selectors.page.resetState);
    const hasChanges = useCreationStore(selectors.page.hasChanges);

    // Form State
    const setFormState = useCreationStore(selectors.form.set);
    const resetFormState = useCreationStore(selectors.form.reset);
    const status = useCreationStore(selectors.form.status);
    const showLogs = useCreationStore(selectors.form.showLogs);
    const logToken = useCreationStore(selectors.form.logToken);
    const formSubmitError = useCreationStore(selectors.form.error);
    const saveStatus = useCreationStore(selectors.form.saveStatus);
    const exitWhenLogsClose = useCreationStore(
        selectors.form.exitWhenLogsClose
    );

    // Editor state
    const draftId = useEditorStore(editorStoreSelectors.draftId);
    const setDraftId = useEditorStore(editorStoreSelectors.setDraftId);

    const helpers = {
        callFailed: (formState: any, subscription?: RealtimeSubscription) => {
            const setFailureState = () => {
                setFormState({
                    status: CreationFormStatus.IDLE,
                    exitWhenLogsClose: false,
                    saveStatus: intl.formatMessage({
                        id: 'materializationCreation.status.failure',
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
                        status: CreationFormStatus.IDLE,
                    });
                })
                .catch(() => {});
        },
        exit: () => {
            resetState();

            navigate(routeDetails.materializations.path);
        },
        jobFailed: (errorTitle: string) => {
            setFormState({
                error: {
                    title: errorTitle,
                },
                saveStatus: intl.formatMessage({
                    id: 'materializationCreation.status.failure',
                }),
            });
        },
    };

    const waitFor = {
        base: (query: any, success: Function, failureTitle: string) => {
            setDraftId(null);
            resetFormState(CreationFormStatus.TESTING);

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
        publications: () => {
            return waitFor.base(
                supabaseClient.from(TABLES.PUBLICATIONS),
                () => {
                    setFormState({
                        status: CreationFormStatus.IDLE,
                        exitWhenLogsClose: true,
                        saveStatus: intl.formatMessage({
                            id: 'materializationCreation.status.success',
                        }),
                    });

                    showNotification(notification);
                },
                'materializationCreation.save.failure.errorTitle'
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

        // TODO: Add preview-specific content to language file and replace the test-specific content in this function.
        preview: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            let detailHasErrors = false;
            let specHasErrors = false;

            // TODO - this was to make TS/Linting happy
            detailHasErrors = detailErrors ? detailErrors.length > 0 : false;
            specHasErrors = specErrors ? specErrors.length > 0 : false;

            const connectorInfo = connectorTags?.data.find(
                ({ id }) => id === imageTagId
            );

            if (detailHasErrors || specHasErrors) {
                setFormState({ showValidation: true });
            } else if (collections.length === 0) {
                // TODO: Handle the scenario where no collections are present.
            } else if (!connectorInfo) {
                // TODO: Handle the highly unlikely scenario where the connector tag id could not be found.
            } else {
                const {
                    connectors: { image_name },
                    image_tag,
                } = connectorInfo;

                const draftSpecPatch: MaterializationDef = {
                    bindings: collections.map((source) => ({
                        resource: {},
                        source,
                    })),
                    endpoint: {
                        connector: {
                            config: endpointConfig,
                            image: `${image_name}${image_tag}`,
                        },
                    },
                };

                supabaseClient
                    .from(TABLES.DRAFTS)
                    .insert({
                        detail: catalogNamespace,
                    })
                    .then(
                        (draftsResponse) => {
                            if (
                                draftsResponse.data &&
                                draftsResponse.data.length > 0
                            ) {
                                supabaseClient
                                    .from(TABLES.DRAFT_SPECS)
                                    .insert([
                                        {
                                            draft_id: draftsResponse.data[0].id,
                                            catalog_name: catalogNamespace,
                                            spec_type: 'materialization',
                                            spec_patch: draftSpecPatch,
                                        },
                                    ])
                                    .then(
                                        (draftSpecsResponse) => {
                                            if (draftSpecsResponse.error) {
                                                helpers.callFailed({
                                                    error: {
                                                        title: 'materializationCreation.test.failure.errorTitle',
                                                        error: draftSpecsResponse.error,
                                                    },
                                                });
                                            }
                                        },
                                        () => {
                                            helpers.callFailed({
                                                error: {
                                                    title: 'materializationCreation.test.serverUnreachable',
                                                },
                                            });
                                        }
                                    );
                            } else if (draftsResponse.error) {
                                helpers.callFailed({
                                    error: {
                                        title: 'materializationCreation.test.failure.errorTitle',
                                        error: draftsResponse.error,
                                    },
                                });
                            }
                        },
                        () => {
                            helpers.callFailed({
                                error: {
                                    title: 'materializationCreation.test.serverUnreachable',
                                },
                            });
                        }
                    );
            }
        },

        test: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const publicationsSubscription = waitFor.publications();
            supabaseClient
                .from(TABLES.PUBLICATIONS)
                .insert([
                    {
                        draft_id: draftId,
                        dry_run: true,
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
                                        title: 'materializationCreation.test.failure.errorTitle',
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
                                    title: 'materializationCreation.test.serverUnreachable',
                                },
                            },
                            publicationsSubscription
                        );
                    }
                );
        },

        saveAndPublish: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            const publicationsSubscription = waitFor.publications();
            supabaseClient
                .from(TABLES.PUBLICATIONS)
                .insert([
                    {
                        draft_id: draftId,
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
                                        title: 'materializationCreation.save.failure.errorTitle',
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
                                    title: 'materializationCreation.save.serverUnreachable',
                                },
                                saveStatus: intl.formatMessage({
                                    id: 'materializationCreation.status.failure',
                                }),
                            },
                            publicationsSubscription
                        );
                    }
                );
        },
    };

    return (
        <PageContainer>
            <LogDialog
                open={showLogs}
                token={logToken}
                title={intl.formatMessage({
                    id: 'materializationCreation.save.inProgress',
                })}
                actionComponent={
                    <>
                        {saveStatus}
                        <Button
                            disabled={status !== CreationFormStatus.IDLE}
                            onClick={handlers.closeLogs}
                        >
                            <FormattedMessage id="cta.close" />
                        </Button>
                    </>
                }
            />

            <NewMaterializationHeader
                close={handlers.cancel}
                test={handlers.test}
                testDisabled={
                    status !== CreationFormStatus.IDLE || !hasConnectors
                }
                save={handlers.saveAndPublish}
                saveDisabled={status !== CreationFormStatus.IDLE || !draftId}
            />

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : (
                <>
                    <Collapse in={formSubmitError !== null}>
                        {formSubmitError && (
                            <NewMaterializationError
                                title={formSubmitError.title}
                                error={formSubmitError.error}
                                logToken={logToken}
                            />
                        )}
                    </Collapse>

                    <form id={FORM_ID}>
                        {connectorTags && (
                            <ErrorBoundryWrapper>
                                <NewMaterializationDetails
                                    connectorTags={connectorTags.data}
                                />
                            </ErrorBoundryWrapper>
                        )}

                        {imageTagId && (
                            <ErrorBoundryWrapper>
                                <NewMaterializationSpec
                                    connectorImage={imageTagId}
                                />

                                <CollectionSelector
                                    preview={handlers.preview}
                                />
                            </ErrorBoundryWrapper>
                        )}
                    </form>
                </>
            )}
        </PageContainer>
    );
}

export default MaterializationCreate;
