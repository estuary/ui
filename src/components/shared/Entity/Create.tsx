import { Alert, Collapse } from '@mui/material';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { routeDetails } from 'app/Authenticated';
import CollectionConfig from 'components/collection/Config';
import { EditorStoreState } from 'components/editor/Store';
import CatalogEditor from 'components/shared/Entity/CatalogEditor';
import DetailsForm from 'components/shared/Entity/DetailsForm';
import EndpointConfig from 'components/shared/Entity/EndpointConfig';
import EntityError from 'components/shared/Entity/Error';
import LogDialog from 'components/shared/Entity/LogDialog';
import Error from 'components/shared/Error';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useClient } from 'hooks/supabase-swr';
import { usePrompt } from 'hooks/useBlocker';
import useBrowserTitle from 'hooks/useBrowserTitle';
import useCombinedGrantsExt from 'hooks/useCombinedGrantsExt';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { ReactNode, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { entityCreateStoreSelectors, FormStatus } from 'stores/Create';

interface Props {
    title: string;
    connectorType: 'capture' | 'materialization';
    formID: string;
    Header: any;
    logAction: ReactNode;
    showCollections?: boolean;
}

function EntityCreate({
    title,
    connectorType,
    formID,
    logAction,
    showCollections,
    Header,
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
        useConnectorWithTagDetail(connectorType); //'capture'
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

            {Header}

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
                                    accessGrants={combinedGrants}
                                />
                            </ErrorBoundryWrapper>
                        ) : (
                            <Alert severity="warning">
                                <FormattedMessage
                                    id={`${messagePrefix}.missingConnectors`}
                                />
                            </Alert>
                        )}

                        {imageTag?.id ? (
                            <ErrorBoundryWrapper>
                                <EndpointConfig connectorImage={imageTag.id} />
                            </ErrorBoundryWrapper>
                        ) : null}

                        {showCollections && imageTag?.id ? (
                            <ErrorBoundryWrapper>
                                <CollectionConfig />
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

export default EntityCreate;
