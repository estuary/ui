import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import { EditorStoreState } from 'components/editor/Store';
import MaterializeGenerateButton from 'components/materialization/GenerateButton';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
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
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

const connectorType = 'materialization';

function MaterializationCreate() {
    const navigate = useNavigate();

    // Supabase
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorWithTagDetail(connectorType);
    const hasConnectors = connectorTags.length > 0;

    const useEntityCreateStore = useRouteStore();
    const imageTag = useEntityCreateStore(
        entityCreateStoreSelectors.details.connectorTag
    );
    const hasChanges = useEntityCreateStore(
        entityCreateStoreSelectors.hasChanges
    );
    const resetState = useEntityCreateStore(
        entityCreateStoreSelectors.resetState
    );
    const setFormState = useEntityCreateStore(
        entityCreateStoreSelectors.formState.set
    );
    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );

    // Form State
    const exitWhenLogsClose = useEntityCreateStore(
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
                supabaseClient
                    .removeSubscription(subscription)
                    .then(() => {
                        setFailureState();
                    })
                    .catch(() => {});
            } else {
                setFailureState();
            }
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

    // const waitFor = {
    //     base: (query: any, success: Function, failureTitle: string) => {
    //         return startSubscription(query, success, () => {
    //             helpers.jobFailed(failureTitle);
    //         });
    //     },
    //     publications: (newDraftId: string) => {
    //         return waitFor.base(
    //             supabaseClient.from(
    //                 `${TABLES.PUBLICATIONS}:draft_id=eq.${newDraftId}`
    //             ),
    //             () => {
    //                 setFormState({
    //                     status: FormStatus.INIT,
    //                 });
    //             },
    //             'materializationCreate.test.failure.errorTitle'
    //         );
    //     },
    // };

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
                            <EntityTestButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                closeLogs={handlers.closeLogs}
                            />
                        }
                        SaveButton={
                            <EntitySaveButton
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
