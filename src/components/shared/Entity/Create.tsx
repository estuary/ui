import { Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import FooHeader from 'components/shared/Entity/Header';
import LogDialog from 'components/shared/Entity/LogDialog';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useClient } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useConnectorTags from 'hooks/useConnectorTags';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { ReactNode, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { TABLES } from 'services/supabase';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';
import useNotificationStore, {
    notificationStoreSelectors,
} from 'stores/NotificationStore';

interface Props {
    title: string;
    connectorType: 'capture' | 'materialize';
    formID: string;
    successNotification: any;
    messagePrefix: 'materializationCreation' | 'captureCreation';
    TestButton: any;
    SaveButton: any;
    logAction: ReactNode;
}

function Create({
    title,
    connectorType,
    formID,
    successNotification,
    messagePrefix,
    TestButton,
    SaveButton,
    logAction,
}: Props) {
    useBrowserTitle(title); //'browserTitle.captureCreate'

    // misc hooks
    const navigate = useNavigate();

    // Supabase stuff
    const supabaseClient = useClient();
    const { combinedGrants } = useCombinedGrantsExt({
        adminOnly: true,
    });

    const { connectorTags, error: connectorTagsError } =
        useConnectorTags(connectorType); //'capture'
    const hasConnectors = connectorTags.length > 0;

    // Notification store
    const showNotification = useNotificationStore(
        notificationStoreSelectors.showNotification
    );

    // Form store
    const entityCreateStore = useRouteStore();
    const imageTag = entityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const hasChanges = entityCreateStore(entityCreateStoreSelectors.hasChanges);
    const resetState = entityCreateStore(entityCreateStoreSelectors.resetState);

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

    //Editor state
    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >((state) => state.setId);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    const setPubId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setPubId']
    >((state) => state.setPubId);

    // Reset the cataolg if the connector changes
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
                .then(() => {})
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
                status: FormStatus.FAILED,
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
            setDraftId(null);
            return waitFor.base(
                supabaseClient.from(TABLES.DISCOVERS),
                (payload: any) => {
                    setFormState({
                        status: FormStatus.IDLE,
                    });
                    setDraftId(payload.new.draft_id);
                },
                `${messagePrefix}.test.failedErrorTitle`
            );
        },
        publications: () => {
            return waitFor.base(
                supabaseClient.from(TABLES.PUBLICATIONS),
                (payload: any) => {
                    setPubId(payload.new.id);
                    setFormState({
                        status: FormStatus.SUCCESS,
                        exitWhenLogsClose: true,
                    });

                    showNotification(successNotification);
                },
                `${messagePrefix}.save.failedErrorTitle`
            );
        },
    };

    usePrompt('confirm.loseData', !exitWhenLogsClose && hasChanges(), () => {
        resetState();
    });

    return (
        <>
            <LogDialog
                open={showLogs}
                token={logToken}
                title={
                    <FormattedMessage
                        id={`${messagePrefix}.save.waitMessage`}
                    />
                }
                actionComponent={logAction}
            />

            <FooHeader
                TestButton={
                    <TestButton
                        disabled={!hasConnectors}
                        formId={formID}
                        onFailure={helpers.callFailed}
                        subscription={waitFor.discovers}
                    />
                }
                SaveButton={
                    <SaveButton
                        disabled={!draftId}
                        onFailure={helpers.callFailed}
                        subscription={waitFor.publications}
                    />
                }
                heading={<FormattedMessage id={`${messagePrefix}.heading`} />}
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

                    <form id={formID}>
                        {hasConnectors ? (
                            <ErrorBoundryWrapper>
                                <DetailsForm
                                    connectorTags={connectorTags}
                                    messagePrefix={messagePrefix}
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
                        <CatalogEditor
                            messageId={`${messagePrefix}.finalReview.instructions`}
                        />
                    </ErrorBoundryWrapper>
                </>
            )}
        </>
    );
}

export default Create;
