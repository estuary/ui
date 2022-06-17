import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import { EditorStoreState } from 'components/editor/Store';
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
import { DraftEditorStoreNames, useZustandStore } from 'context/Zustand';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import { startSubscription, TABLES } from 'services/supabase';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';
import { getPathWithParam } from 'utils/misc-utils';

const connectorType = 'capture';

function CaptureCreate() {
    const navigate = useNavigate();

    // Supabase stuff
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorWithTagDetail(connectorType);
    const hasConnectors = connectorTags.length > 0;

    // Form store
    const useEntityCreateStore = useRouteStore();
    const messagePrefix = useEntityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );
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
    const exitWhenLogsClose = useEntityCreateStore(
        entityCreateStoreSelectors.formState.exitWhenLogsClose
    );

    //Editor state
    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >(DraftEditorStoreNames.CAPTURE, (state) => state.setId);

    const pubId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['pubId']
    >(DraftEditorStoreNames.CAPTURE, (state) => state.pubId);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >(DraftEditorStoreNames.CAPTURE, (state) => state.id);

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

            navigate(authenticatedRoutes.captures.path);
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

        materializeCollections: () => {
            helpers.exit();
            navigate(
                getPathWithParam(
                    authenticatedRoutes.materializations.create.fullPath,
                    authenticatedRoutes.materializations.create.params.specID,
                    pubId
                )
            );
        },
    };

    const discoversSubscription = (discoverDraftId: string) => {
        setDraftId(null);
        return startSubscription(
            supabaseClient.from(
                `${TABLES.DISCOVERS}:draft_id=eq.${discoverDraftId}`
            ),
            (payload: any) => {
                setDraftId(payload.draft_id);
                setFormState({
                    status: FormStatus.GENERATED,
                });
            },
            () => {
                helpers.jobFailed(`${messagePrefix}.test.failedErrorTitle`);
            }
        );
    };

    usePrompt('confirm.loseData', !exitWhenLogsClose && hasChanges(), () => {
        resetState();
    });

    return (
        <PageContainer>
            <EntityCreate
                title="browserTitle.captureCreate"
                connectorType={connectorType}
                Header={
                    <FooHeader
                        heading={
                            <FormattedMessage id={`${messagePrefix}.heading`} />
                        }
                        GenerateButton={
                            <CaptureGenerateButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                subscription={discoversSubscription}
                                draftEditorStoreName={
                                    DraftEditorStoreNames.CAPTURE
                                }
                            />
                        }
                        TestButton={
                            <EntityTestButton
                                closeLogs={handlers.closeLogs}
                                callFailed={helpers.callFailed}
                                disabled={!hasConnectors}
                                logEvent={CustomEvents.CAPTURE_TEST}
                                draftEditorStoreName={
                                    DraftEditorStoreNames.CAPTURE
                                }
                            />
                        }
                        SaveButton={
                            <EntitySaveButton
                                closeLogs={handlers.closeLogs}
                                callFailed={helpers.callFailed}
                                disabled={!draftId}
                                draftEditorStoreName={
                                    DraftEditorStoreNames.CAPTURE
                                }
                                materialize={handlers.materializeCollections}
                                logEvent={CustomEvents.CAPTURE_CREATE}
                            />
                        }
                    />
                }
                draftEditorStoreName={DraftEditorStoreNames.CAPTURE}
            />
        </PageContainer>
    );
}

export default CaptureCreate;
