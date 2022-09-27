import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
// import CaptureGenerateButton from 'components/capture/GenerateButton';
import {
    useEditorStore_id,
    useEditorStore_pubId,
    useEditorStore_setId,
} from 'components/editor/Store';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityEdit from 'components/shared/Entity/Edit';
import FooHeader from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary/capture';
import PageContainer from 'components/shared/PageContainer';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
// import LogRocket from 'logrocket';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
// import { startSubscription, TABLES } from 'services/supabase';
import {
    useDetailsForm_changed,
    useDetailsForm_connectorImage,
    useDetailsForm_errorsExist,
    useDetailsForm_resetState,
} from 'stores/DetailsForm';
import { EndpointConfigProvider } from 'stores/EndpointConfig';
import {
    FormStatus,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_messagePrefix,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState';
import { ENTITY } from 'types';
import { getPathWithParams } from 'utils/misc-utils';

// const trackEvent = (payload: any) => {
//     LogRocket.track(CustomEvents.CAPTURE_DISCOVER, {
//         name: payload.capture_name,
//         id: payload.id,
//         draft_id: payload.draft_id,
//         logs_token: payload.logs_token,
//         status: payload.job_status.type,
//     });
// };

function CaptureEdit() {
    const navigate = useNavigate();

    const entityType = ENTITY.CAPTURE;

    // Supabase stuff
    const supabaseClient = useClient();

    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();
    const detailsFormErrorsExist = useDetailsForm_errorsExist();
    const detailsFormChanged = useDetailsForm_changed();
    const resetDetailsForm = useDetailsForm_resetState();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    const pubId = useEditorStore_pubId();

    // TODO (placement): Relocate endpoint config-related store selectors.
    // Endpoint Config Store
    // const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    // const resetEndpointConfigState = useEndpointConfigStore_reset();
    // const endpointConfigChanged = useEndpointConfigStore_changed();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    const setFormState = useFormStateStore_setFormState();

    const resetFormState = useFormStateStore_resetState();

    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetDetailsForm();
        // resetEndpointConfigState();
        resetFormState();
    };

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
                pubId
                    ? getPathWithParams(
                          authenticatedRoutes.materializations.create.fullPath,
                          {
                              [GlobalSearchParams.LAST_PUB_ID]: pubId,
                          }
                      )
                    : authenticatedRoutes.materializations.create.fullPath
            );
        },
    };

    // const discoversSubscription = (discoverDraftId: string) => {
    //     setDraftId(null);
    //     return startSubscription(
    //         supabaseClient.from(
    //             `${TABLES.DISCOVERS}:draft_id=eq.${discoverDraftId}`
    //         ),
    //         (payload: any) => {
    //             setDraftId(payload.draft_id);
    //             setFormState({
    //                 status: FormStatus.GENERATED,
    //             });
    //             trackEvent(payload);
    //         },
    //         (payload: any) => {
    //             helpers.jobFailed(`${messagePrefix}.test.failedErrorTitle`);
    //             trackEvent(payload);
    //         }
    //     );
    // };

    return (
        <PageContainer>
            <EndpointConfigProvider entityType={entityType}>
                <EntityEdit
                    title="browserTitle.captureEdit"
                    entityType={entityType}
                    promptDataLoss={
                        detailsFormChanged()
                        //  || endpointConfigChanged()
                    }
                    resetState={resetState}
                    Header={
                        <FooHeader
                            heading={
                                <FormattedMessage
                                    id={`${messagePrefix}.heading`}
                                />
                            }
                            TestButton={
                                <EntityTestButton
                                    closeLogs={handlers.closeLogs}
                                    callFailed={helpers.callFailed}
                                    disabled={!hasConnectors}
                                    logEvent={CustomEvents.CAPTURE_TEST}
                                />
                            }
                            SaveButton={
                                <EntitySaveButton
                                    closeLogs={handlers.closeLogs}
                                    callFailed={helpers.callFailed}
                                    disabled={!draftId}
                                    materialize={
                                        handlers.materializeCollections
                                    }
                                    logEvent={CustomEvents.CAPTURE_EDIT}
                                />
                            }
                            ErrorSummary={
                                <ValidationErrorSummary
                                    errorsExist={
                                        detailsFormErrorsExist
                                        // || endpointConfigErrorsExist
                                    }
                                />
                            }
                        />
                    }
                    callFailed={helpers.callFailed}
                    readOnly={{ detailsForm: true }}
                />
            </EndpointConfigProvider>
        </PageContainer>
    );
}

export default CaptureEdit;
