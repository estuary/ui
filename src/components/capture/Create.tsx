import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import TestButton from 'components/capture/TestButton';
import { EditorStoreState } from 'components/editor/Store';
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
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { startSubscription, TABLES } from 'services/supabase';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';
import { getPathWithParam } from 'utils/misc-utils';

const FORM_ID = 'newCaptureForm';
const connectorType = 'capture';

function CaptureCreate() {
    const navigate = useNavigate();

    // Supabase stuff
    const supabaseClient = useClient();
    const { connectorTags } = useConnectorTags(connectorType);
    const hasConnectors = connectorTags.length > 0;

    // Form store
    const entityCreateStore = useRouteStore();
    const messagePrefix = entityCreateStore(
        entityCreateStoreSelectors.messagePrefix
    );
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

    const exitWhenLogsClose = entityCreateStore(
        entityCreateStoreSelectors.formState.exitWhenLogsClose
    );

    //Editor state
    const setDraftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['setId']
    >((state) => state.setId);

    const pubId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['pubId']
    >((state) => state.pubId);

    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

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
                    routeDetails.materializations.create.fullPath,
                    routeDetails.materializations.create.params.specID,
                    pubId
                )
            );
        },
    };

    const waitFor = {
        base: (query: any, success: Function, failureTitle: string) => {
            resetFormState(FormStatus.TESTING);
            return startSubscription(query, success, () => {
                helpers.jobFailed(failureTitle);
            });
        },
        discovers: () => {
            setDraftId(null);
            return waitFor.base(
                supabaseClient.from(
                    `${TABLES.PUBLICATIONS}:draft_id=eq.${draftId}`
                ),
                (payload: any) => {
                    setFormState({
                        status: FormStatus.IDLE,
                    });
                    setDraftId(payload.new.draft_id);
                },
                `${messagePrefix}.test.failedErrorTitle`
            );
        },
    };

    usePrompt('confirm.loseData', !exitWhenLogsClose && hasChanges(), () => {
        resetState();
    });

    return (
        <PageContainer>
            <EntityCreate
                title="browserTitle.captureCreate"
                connectorType={connectorType}
                formID={FORM_ID}
                Header={
                    <FooHeader
                        TestButton={
                            <TestButton
                                disabled={!hasConnectors}
                                formId={FORM_ID}
                                onFailure={helpers.callFailed}
                                subscription={waitFor.discovers}
                            />
                        }
                        SaveButton={
                            <EntityCreateSaveButton
                                disabled={!draftId}
                                formId={FORM_ID}
                                onFailure={helpers.callFailed}
                            />
                        }
                        heading={
                            <FormattedMessage id={`${messagePrefix}.heading`} />
                        }
                    />
                }
                logAction={
                    <LogDialogActions
                        close={handlers.closeLogs}
                        materialize={{
                            action: handlers.materializeCollections,
                            title: 'captureCreate.ctas.materialize',
                        }}
                    />
                }
            />
        </PageContainer>
    );
}

export default CaptureCreate;
