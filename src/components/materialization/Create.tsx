import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import MaterializeSaveButton from 'components/materialization/SaveButton';
import MaterializeTestButton from 'components/materialization/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import FooHeader from 'components/shared/Entity/Header';
import PageContainer from 'components/shared/PageContainer';
import { useClient } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { startSubscription, TABLES } from 'services/supabase';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

const FORM_ID = 'newMaterializationForm';
const connectorType = 'materialization';

function MaterializationCreate() {
    const navigate = useNavigate();

    // Supabase
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorWithTagDetail(connectorType);
    const hasConnectors = connectorTags.length > 0;

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
        publications: (newDraftId: string) => {
            return waitFor.base(
                supabaseClient.from(
                    `${TABLES.PUBLICATIONS}:draft_id=eq.${newDraftId}`
                ),
                () => {
                    setFormState({
                        status: FormStatus.IDLE,
                    });
                },
                'materializationCreate.test.failure.errorTitle'
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
                        GenerateButton={
                            <MaterializeGenerateButton
                                disabled={!hasConnectors}
                                onFailure={helpers.callFailed}
                            />
                        }
                        TestButton={
                            <MaterializeTestButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                closeLogs={waitFor.publications}
                            />
                        }
                        SaveButton={
                            <MaterializeSaveButton
                                disabled={!draftId}
                                callFailed={helpers.callFailed}
                                closeLogs={handlers.closeLogs}
                            />
                        }
                        heading={
                            <FormattedMessage id={`${messagePrefix}.heading`} />
                        }
                    />
                }
            />
        </PageContainer>
    );
}

export default MaterializationCreate;
