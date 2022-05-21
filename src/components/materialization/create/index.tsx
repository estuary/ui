import { Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import CollectionConfig from 'components/materialization/create/CollectionConfig';
import Test from 'components/materialization/create/Test';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import FooHeader from 'components/shared/Entity/Header';
import LogDialog from 'components/shared/Entity/LogDialog';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import PageContainer from 'components/shared/PageContainer';
import { useClient } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useConnectorTags from 'hooks/useConnectorTags';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { isEmpty } from 'lodash';
import { MouseEvent, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { getEncryptedConfig } from 'services/encryption';
import { TABLES } from 'services/supabase';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';
import useNotificationStore, {
    Notification,
    NotificationState,
} from 'stores/NotificationStore';

const FORM_ID = 'newMaterializationForm';

const selectors = {
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
    const navigate = useNavigate();

    // Supabase
    const supabaseClient = useClient();
    const { combinedGrants, isValidating } = useCombinedGrantsExt({
        adminOnly: true,
    });
    const { connectorTags, error: connectorTagsError } =
        useConnectorTags('materialization');
    const hasConnectors = connectorTags.length > 0;

    // Notification store
    const showNotification = useNotificationStore(
        selectors.notifications.showNotification
    );

    const entityCreateStore = useRouteStore();

    // Materializations store
    const resourceConfig = entityCreateStore(
        entityCreateStoreSelectors.resourceConfig.get
    );

    // Form store
    const entityName = entityCreateStore(
        entityCreateStoreSelectors.details.entityName
    );
    const imageTag = entityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const entityDescription = entityCreateStore(
        entityCreateStoreSelectors.details.description
    );
    const endpointConfig = entityCreateStore(
        entityCreateStoreSelectors.endpointConfig.data
    );
    const endpointSchema = entityCreateStore(
        entityCreateStoreSelectors.endpointSchema
    );
    const hasChanges = entityCreateStore(entityCreateStoreSelectors.hasChanges);
    const resetState = entityCreateStore(entityCreateStoreSelectors.resetState);
    const [detailErrors, specErrors] = entityCreateStore(
        entityCreateStoreSelectors.errors
    );

    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const resetFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.reset
    );

    // Form State
    const showLogs = entityCreateStore(
        entityCreateStoreSelectors.formState.showLogs
    );
    const logToken = entityCreateStore(
        entityCreateStoreSelectors.formState.logToken
    );
    const formSubmitError = entityCreateStore(
        entityCreateStoreSelectors.formState.error
    );
    const exitWhenLogsClose = entityCreateStore(
        entityCreateStoreSelectors.formState.exitWhenLogsClose
    );

    // Editor state
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >((state) => state.setId);

    // Reset the catalog if the connector changes
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
                status: FormStatus.FAILED,
            });
        },
    };

    const waitFor = {
        base: (query: any, success: Function, failureTitle: string) => {
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
                        status: FormStatus.SUCCESS,
                        exitWhenLogsClose: true,
                    });

                    showNotification(notification);
                },
                'materializationCreation.save.failure.errorTitle'
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

        test: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            let detailHasErrors = false;
            let specHasErrors = false;

            // TODO - this was to make TS/Linting happy
            detailHasErrors = detailErrors ? detailErrors.length > 0 : false;
            specHasErrors = specErrors ? specErrors.length > 0 : false;

            const connectorInfo = connectorTags.find(
                ({ id }) => id === imageTag?.id
            );

            if (detailHasErrors || specHasErrors) {
                setFormState({
                    status: FormStatus.IDLE,
                    displayValidation: true,
                });
            } else if (isEmpty(resourceConfig)) {
                // TODO: Handle the scenario where no collections are present.
                setFormState({
                    status: FormStatus.IDLE,
                    displayValidation: true,
                });
            } else if (!connectorInfo) {
                // TODO: Handle the highly unlikely scenario where the connector tag id could not be found.
                setFormState({
                    status: FormStatus.IDLE,
                    displayValidation: true,
                });
            } else {
                setFormState({
                    status: FormStatus.GENERATING_PREVIEW,
                });
                setDraftId(null);

                const {
                    connectors: { image_name },
                    image_tag,
                } = connectorInfo;

                supabaseClient
                    .from(TABLES.DRAFTS)
                    .insert({
                        detail: entityName,
                    })
                    .then(
                        async (draftsResponse) => {
                            if (
                                draftsResponse.data &&
                                draftsResponse.data.length > 0
                            ) {
                                getEncryptedConfig({
                                    data: {
                                        schema: endpointSchema,
                                        config: endpointConfig,
                                    },
                                })
                                    .then((encryptedEndpointConfig) => {
                                        const newDraftId =
                                            draftsResponse.data[0].id;

                                        // TODO (typing) MaterializationDef
                                        const draftSpec: any = {
                                            bindings: [],
                                            endpoint: {
                                                connector: {
                                                    config: encryptedEndpointConfig,
                                                    image: `${image_name}${image_tag}`,
                                                },
                                            },
                                        };

                                        Object.keys(resourceConfig).forEach(
                                            (collectionName) => {
                                                draftSpec.bindings.push({
                                                    source: collectionName,
                                                    resource: {
                                                        ...resourceConfig[
                                                            collectionName
                                                        ].data,
                                                    },
                                                });
                                            }
                                        );

                                        supabaseClient
                                            .from(TABLES.DRAFT_SPECS)
                                            .insert([
                                                {
                                                    draft_id: newDraftId,
                                                    catalog_name: entityName,
                                                    spec_type:
                                                        'materialization',
                                                    spec: draftSpec,
                                                },
                                            ])
                                            .then(
                                                (draftSpecsResponse) => {
                                                    setDraftId(newDraftId);
                                                    setFormState({
                                                        status: FormStatus.IDLE,
                                                    });

                                                    if (
                                                        draftSpecsResponse.error
                                                    ) {
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
                                    })
                                    .catch((error) => {
                                        helpers.callFailed({
                                            error: {
                                                title: 'captureCreation.test.failedConfigEncryptTitle',
                                                error,
                                            },
                                        });
                                    });
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

        saveAndPublish: (event: MouseEvent<HTMLElement>) => {
            event.preventDefault();

            resetFormState(FormStatus.SAVING);
            const publicationsSubscription = waitFor.publications();

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
                            },
                            publicationsSubscription
                        );
                    }
                );
        },

        oldTest: (event: MouseEvent<HTMLElement>) => {
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
                    <FormattedMessage id="materializationCreation.save.inProgress" />
                }
                actionComponent={
                    <LogDialogActions close={handlers.closeLogs} />
                }
            />

            <FooHeader
                TestButton={
                    <Test
                        disabled={!hasConnectors}
                        formId={FORM_ID}
                        onFailure={helpers.callFailed}
                    />
                }
                save={handlers.saveAndPublish}
                saveDisabled={!draftId}
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
                                draftId={draftId}
                            />
                        )}
                    </Collapse>

                    <form>
                        {hasConnectors && !isValidating && (
                            <ErrorBoundryWrapper>
                                <DetailsForm
                                    connectorTags={connectorTags}
                                    messagePrefix="materializationCreation"
                                    accessGrants={combinedGrants}
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
