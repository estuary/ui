import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import MaterializeTestButton from 'components/materialization/create/TestButton';
import EntityCreateSaveButton from 'components/shared/Entity/Actions/Savebutton';
import EntityCreate from 'components/shared/Entity/Create';
import FooHeader from 'components/shared/Entity/Header';
import LogDialogActions from 'components/shared/Entity/LogDialogActions';
import PageContainer from 'components/shared/PageContainer';
import { useClient } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useConnectorTags from 'hooks/useConnectorTags';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { startSubscription, TABLES } from 'services/supabase';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';
import useNotificationStore, {
    Notification,
    NotificationState,
} from 'stores/NotificationStore';
import useConstant from 'use-constant';

const FORM_ID = 'newMaterializationForm';
const connectorType = 'materialization';

const selectors = {
    notifications: {
        showNotification: (state: NotificationState) => state.showNotification,
    },
};

function MaterializationCreate() {
    const intl = useIntl();

    const successNotification: Notification = useConstant(() => {
        return {
            description: intl.formatMessage(
                {
                    id: 'notifications.create.description',
                },
                {
                    entityType: intl.formatMessage({
                        id: 'terms.materialization',
                    }),
                }
            ),
            severity: 'success',
            title: intl.formatMessage(
                {
                    id: 'notifications.create.title',
                },
                {
                    entityType: intl.formatMessage({
                        id: 'terms.materialization',
                    }),
                }
            ),
        };
    });

    // Misc. hooks
    const navigate = useNavigate();

    // Supabase
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorTags(connectorType);
    const hasConnectors = connectorTags.length > 0;

    // Notification store
    const showNotification = useNotificationStore(
        selectors.notifications.showNotification
    );

    const entityCreateStore = useRouteStore();
    const imageTag = entityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const hasChanges = entityCreateStore(entityCreateStoreSelectors.hasChanges);
    const resetState = entityCreateStore(entityCreateStoreSelectors.resetState);
    const setFormState = entityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const messagePrefix = entityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    // Form State
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
            return startSubscription(query, success, () => {
                helpers.jobFailed(failureTitle);
            });
        },
        publications: (dryRun: boolean) => {
            return waitFor.base(
                supabaseClient.from(TABLES.PUBLICATIONS),
                () => {
                    if (dryRun) {
                        setFormState({
                            status: FormStatus.IDLE,
                        });
                    } else {
                        setFormState({
                            status: FormStatus.SUCCESS,
                            exitWhenLogsClose: true,
                        });

                        showNotification(successNotification);
                    }
                },
                'materializationCreate.save.failure.errorTitle'
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
    };

    usePrompt('confirm.loseData', !exitWhenLogsClose && hasChanges(), () => {
        resetState();
    });

    return (
        <PageContainer>
            <EntityCreate
                title="browserTitle.materializationCreate"
                connectorType={connectorType}
                formID={FORM_ID}
                showCollections
                Header={
                    <FooHeader
                        TestButton={
                            <MaterializeTestButton
                                disabled={!hasConnectors}
                                onFailure={helpers.callFailed}
                                subscription={waitFor.publications}
                                formId={FORM_ID}
                            />
                        }
                        SaveButton={
                            <EntityCreateSaveButton
                                disabled={!draftId}
                                onFailure={helpers.callFailed}
                                subscription={waitFor.publications}
                                formId={FORM_ID}
                            />
                        }
                        heading={
                            <FormattedMessage id={`${messagePrefix}.heading`} />
                        }
                    />
                }
                logAction={<LogDialogActions close={handlers.closeLogs} />}
            />
        </PageContainer>
    );
}

export default MaterializationCreate;
