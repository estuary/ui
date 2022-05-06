import { Button, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import CollectionConfig from 'components/materialization/create/CollectionConfig';
import useCreationStore, {
    creationSelectors,
    CreationState,
} from 'components/materialization/Store';
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
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useZustandStore } from 'hooks/useZustand';
import { isEmpty } from 'lodash';
import { MouseEvent } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { TABLES } from 'services/supabase';
import useNotificationStore, {
    Notification,
    NotificationState,
} from 'stores/NotificationStore';

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
    const resourceConfig = useCreationStore(creationSelectors.resourceConfig);

    // Form Store
    const entityName = useEntityStore(fooSelectors.entityName);
    const imageTag = useEntityStore(fooSelectors.connectorTag);
    const entityDescription = useEntityStore(fooSelectors.description);
    const [detailErrors, specErrors] = useEntityStore(fooSelectors.errors);
    const resetState = useEntityStore(fooSelectors.resetState);
    const hasChanges = useEntityStore(fooSelectors.hasChanges);

    // Form State
    const setFormState = useEntityStore(fooSelectors.setFormState);
    const resetFormState = useEntityStore(fooSelectors.resetFormState);
    const showLogs = useEntityStore(fooSelectors.showLogs);
    const logToken = useEntityStore(fooSelectors.logToken);
    const formSubmitError = useEntityStore(fooSelectors.error);
    const exitWhenLogsClose = useEntityStore(fooSelectors.exitWhenLogsClose);
    const endpointConfig = useEntityStore(fooSelectors.endpointConfig);
    const formStateSaveStatus = useEntityStore(
        fooSelectors.formStateSaveStatus
    );
    const formStateStatus = useEntityStore(fooSelectors.formStateStatus);

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

            navigate(routeDetails.materializations.path);
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
                                id: 'common.success',
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
            } else if (isEmpty(resourceConfig)) {
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

                // TODO (typing) MaterializationDef
                const draftSpec: any = {
                    bindings: {},
                    endpoint: {
                        connector: {
                            config: endpointConfig,
                            image: `${image_name}${image_tag}`,
                        },
                    },
                };

                Object.keys(resourceConfig).forEach((collectionName) => {
                    draftSpec.bindings[collectionName] = {
                        resource: {
                            ...resourceConfig[collectionName].data,
                        },
                    };
                });

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
                                    id: 'common.fail',
                                }),
                            },
                            publicationsSubscription
                        );
                    }
                );
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
                test={handlers.preview}
                testDisabled={
                    formStateStatus !== FormStatus.IDLE || !hasConnectors
                }
                save={handlers.saveAndPublish}
                saveDisabled={formStateStatus !== FormStatus.IDLE || !draftId}
                formId={FORM_ID}
                heading={
                    <FormattedMessage id="materializationCreation.heading" />
                }
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
                                    <CollectionConfig />
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
