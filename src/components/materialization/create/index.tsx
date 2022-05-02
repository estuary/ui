import { Button, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import CollectionSelector from 'components/materialization/CollectionSelector';
import ResourceConfig from 'components/materialization/ResourceConfig';
import useCreationStore, {
    CreationState,
} from 'components/materialization/Store';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import CatalogEditor from 'components/shared/foo/CatalogEditor';
import DetailsForm from 'components/shared/foo/DetailsForm';
import EndpointConfig from 'components/shared/foo/EndpointConfig';
import FooError from 'components/shared/foo/Error';
import FooHeader from 'components/shared/foo/Header';
import LogDialog from 'components/shared/foo/LogDialog';
import { ConnectorTag, CONNECTOR_TAG_QUERY } from 'components/shared/foo/query';
import useFooStore, {
    fooSelectors,
    FormStatus,
} from 'components/shared/foo/Store';
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
import { MaterializationDef } from '../../../../flow_deps/flow';

const FORM_ID = 'newMaterializationForm';

const selectors = {
    page: {
        collections: (state: CreationState) => state.collections,
        resourceConfigData: (state: CreationState) => state.resourceConfig.data,
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
    useBrowserTitle('browserTitle.materializationCreate');

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

    // Materializations store
    const collections = useCreationStore(selectors.page.collections);
    const resourceConfig = useCreationStore(selectors.page.resourceConfigData);

    // Form Store
    const entityName = useFooStore(fooSelectors.entityName);
    const imageTag = useFooStore(fooSelectors.connectorTag);
    const [detailErrors, specErrors] = useFooStore(fooSelectors.errors);
    const resetState = useFooStore(fooSelectors.resetState);
    const hasChanges = useFooStore(fooSelectors.hasChanges);

    // Form State
    const setFormState = useFooStore(fooSelectors.setFormState);
    const resetFormState = useFooStore(fooSelectors.resetFormState);
    const showLogs = useFooStore(fooSelectors.showLogs);
    const logToken = useFooStore(fooSelectors.logToken);
    const formSubmitError = useFooStore(fooSelectors.error);
    const exitWhenLogsClose = useFooStore(fooSelectors.exitWhenLogsClose);
    const endpointConfig = useFooStore(fooSelectors.endpointConfig);
    const formStateSaveStatus = useFooStore(fooSelectors.formStateSaveStatus);
    const formStateStatus = useFooStore(fooSelectors.formStateStatus);

    // Editor state
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >((state) => state.setId);

    // TODO (materializations) : get this working again
    // const editorSpecs = useZustandStore<
    //     EditorStoreState<DraftSpecQuery>,
    //     EditorStoreState<DraftSpecQuery>['specs']
    // >((state) => state.specs);

    // const editorContainsSpecs = editorSpecs && editorSpecs.length > 0;

    const helpers = {
        callFailed: (formState: any, subscription?: RealtimeSubscription) => {
            const setFailureState = () => {
                setFormState({
                    status: FormStatus.IDLE,
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
                        status: FormStatus.IDLE,
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

    const createPublicationsSubscription = (): RealtimeSubscription => {
        const subscription = supabaseClient
            .from(TABLES.PUBLICATIONS)
            .on('*', async (payload: any) => {
                if (payload.new.job_status.type !== 'queued') {
                    if (payload.new.job_status.type === 'success') {
                        setFormState({
                            status: FormStatus.IDLE,
                            exitWhenLogsClose: true,
                            saveStatus: intl.formatMessage({
                                id: 'materializationCreation.status.success',
                            }),
                        });

                        showNotification(notification);
                    } else {
                        helpers.jobFailed(
                            'materializationCreation.save.failure.errorTitle'
                        );
                    }

                    await helpers.doneSubscribing(subscription);
                }
            })
            .subscribe();

        return subscription;
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
                ({ id }) => id === imageTag?.id
            );

            if (detailHasErrors || specHasErrors) {
                setFormState({ displayValidation: true });
            } else if (collections.length === 0) {
                // TODO: Handle the scenario where no collections are present.
            } else if (!connectorInfo) {
                // TODO: Handle the highly unlikely scenario where the connector tag id could not be found.
            } else {
                setFormState({
                    status: FormStatus.GENERATING_PREVIEW,
                });

                // TODO: Use connector_tags.resource_spec_schema as the value of bindings.resource when the
                // connector_tags schema is updated.
                const {
                    connectors: { image_name },
                    image_tag,
                } = connectorInfo;

                const draftSpec: MaterializationDef = {
                    bindings: collections.map((source) => ({
                        resource: resourceConfig,
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
                        detail: entityName,
                    })
                    .then(
                        (draftsResponse) => {
                            if (
                                draftsResponse.data &&
                                draftsResponse.data.length > 0
                            ) {
                                setDraftId(draftsResponse.data[0].id);

                                supabaseClient
                                    .from(TABLES.DRAFT_SPECS)
                                    .insert([
                                        {
                                            draft_id: draftsResponse.data[0].id,
                                            catalog_name: entityName,
                                            spec_type: 'materialization',
                                            spec: draftSpec,
                                        },
                                    ])
                                    .then(
                                        (draftSpecsResponse) => {
                                            setFormState({
                                                status: FormStatus.IDLE,
                                            });

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
                resetFormState(FormStatus.TESTING);
                const publicationsSubscription =
                    createPublicationsSubscription();

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
            }
        },

        saveAndPublish: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            setDraftId(null);
            resetFormState(FormStatus.SAVING);

            const publicationsSubscription = createPublicationsSubscription();

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
                title={
                    <FormattedMessage id="materializationCreation.save.inProgress" />
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
                saveDisabled={formStateStatus !== FormStatus.IDLE || !draftId}
                formId={FORM_ID}
                heading={<FormattedMessage id="captureCreation.heading" />}
            />

            {connectorTagsError ? (
                <Error error={connectorTagsError} />
            ) : (
                <>
                    <Collapse in={formSubmitError !== null}>
                        {formSubmitError && (
                            <FooError
                                title={formSubmitError.title}
                                error={formSubmitError.error}
                                logToken={logToken}
                            />
                        )}
                    </Collapse>

                    <form>
                        {connectorTags && (
                            <ErrorBoundryWrapper>
                                <DetailsForm
                                    connectorTags={connectorTags.data}
                                    messagePrefix="materializationCreation"
                                />
                            </ErrorBoundryWrapper>
                        )}

                        {imageTag?.id && (
                            <>
                                <ErrorBoundryWrapper>
                                    <EndpointConfig
                                        connectorImage={imageTag.id}
                                    />
                                </ErrorBoundryWrapper>
                                <ErrorBoundryWrapper>
                                    <ResourceConfig
                                        connectorImage={imageTag.id}
                                    />
                                </ErrorBoundryWrapper>
                                <ErrorBoundryWrapper>
                                    <CollectionSelector
                                        preview={handlers.preview}
                                    />
                                </ErrorBoundryWrapper>
                            </>
                        )}
                    </form>

                    <ErrorBoundryWrapper>
                        <CatalogEditor messageId="materializationCreation.finalReview.instructions" />
                    </ErrorBoundryWrapper>
                </>
            )}
        </PageContainer>
    );
}

export default MaterializationCreate;
