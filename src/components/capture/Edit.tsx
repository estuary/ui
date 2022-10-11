import { RealtimeSubscription } from '@supabase/supabase-js';
import { authenticatedRoutes } from 'app/Authenticated';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import {
    useEditorStore_editDraftId,
    useEditorStore_id,
    useEditorStore_pubId,
    useEditorStore_setId,
    useEditorStore_setSpecs,
} from 'components/editor/Store';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityEdit from 'components/shared/Entity/Edit';
import EntityToolbar from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import PageContainer from 'components/shared/PageContainer';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraftSpecs, { DraftSpecQuery } from 'hooks/useDraftSpecs';
import LogRocket from 'logrocket';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import {
    DEFAULT_FILTER,
    handleFailure,
    handleSuccess,
    jobStatusPoller,
    JOB_STATUS_POLLER_ERROR,
    TABLES,
} from 'services/supabase';
import {
    useDetailsForm_connectorImage,
    useDetailsForm_errorsExist,
    useDetailsForm_resetState,
} from 'stores/DetailsForm';
import { useEndpointConfigStore_reset } from 'stores/EndpointConfig';
import {
    FormStatus,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_messagePrefix,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState';
import { ENTITY } from 'types';
import { getPathWithParams } from 'utils/misc-utils';

const trackEvent = (payload: any) => {
    LogRocket.track(CustomEvents.CAPTURE_DISCOVER, {
        name: payload.capture_name ?? DEFAULT_FILTER,
        id: payload.id ?? DEFAULT_FILTER,
        draft_id: payload.draft_id ?? DEFAULT_FILTER,
        logs_token: payload.logs_token ?? DEFAULT_FILTER,
        status: payload.job_status?.type ?? DEFAULT_FILTER,
    });
};
function CaptureEdit() {
    const lastPubId = useGlobalSearchParams(GlobalSearchParams.LAST_PUB_ID);
    const navigate = useNavigate();

    const entityType = ENTITY.CAPTURE;

    // Supabase stuff
    const supabaseClient = useClient();

    const { connectorTags } = useConnectorWithTagDetail(entityType);
    const hasConnectors = connectorTags.length > 0;

    // Details Form Store
    const imageTag = useDetailsForm_connectorImage();
    const detailsFormErrorsExist = useDetailsForm_errorsExist();
    const resetDetailsForm = useDetailsForm_resetState();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const setDraftId = useEditorStore_setId();

    const editDraftId = useEditorStore_editDraftId();

    const pubId = useEditorStore_pubId();

    const setDraftSpecs = useEditorStore_setSpecs();

    // Endpoint Config Store
    const resetEndpointConfigState = useEndpointConfigStore_reset();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } = useDraftSpecs(
        editDraftId,
        lastPubId
    );

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetDetailsForm();
        resetEndpointConfigState();
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

    const storeUpdatedDraftSpec = async () => {
        // TODO (optimization | typing): Narrow the columns selected from the draft_specs_ext table.
        //   More columns are selected than required to appease the typing of the editor store.
        const draftSpecsResponse = await supabaseClient
            .from(TABLES.DRAFT_SPECS_EXT)
            .select(`catalog_name,draft_id,expect_pub_id,spec,spec_type`)
            .eq('draft_id', editDraftId)
            .eq('spec_type', ENTITY.CAPTURE)
            .then(handleSuccess<DraftSpecQuery[]>, handleFailure);
        if (draftSpecsResponse.error) {
            return helpers.callFailed({
                error: {
                    title: 'captureCreate.generate.failedErrorTitle',
                    error: draftSpecsResponse.error,
                },
            });
        }

        if (draftSpecsResponse.data && draftSpecsResponse.data.length > 0) {
            setDraftSpecs(draftSpecsResponse.data);

            void mutateDraftSpecs();
        }
    };

    // TODO (optimization): Consider whether the job status poller should be updated to support
    //   the scenario where multiple discovers table entries are found. Should it be the query's
    //   responsibility to ensure only the latest discovers table entry is selected by the poller?
    const discoversSubscription = (discoverDraftId: string) => {
        setDraftId(null);

        jobStatusPoller(
            supabaseClient
                .from(TABLES.DISCOVERS)
                .select(
                    `
                    draft_id,
                    job_status,
                    created_at
                `
                )
                .match({
                    draft_id: discoverDraftId,
                })
                .order('created_at', { ascending: false }),
            (payload: any) => {
                void storeUpdatedDraftSpec();

                void mutateDraftSpecs();

                setDraftId(payload.draft_id);
                setFormState({
                    status: FormStatus.GENERATED,
                });

                trackEvent(payload);
            },
            (payload: any) => {
                if (payload.error === JOB_STATUS_POLLER_ERROR) {
                    helpers.jobFailed(payload.error);
                } else {
                    helpers.jobFailed(`${messagePrefix}.test.failedErrorTitle`);
                }
            }
        );
    };

    return (
        <PageContainer>
            <EntityEdit
                title="browserTitle.captureEdit"
                entityType={entityType}
                readOnly={{ detailsForm: true }}
                draftSpecMetadata={draftSpecsMetadata}
                callFailed={helpers.callFailed}
                resetState={resetState}
                errorSummary={
                    <ValidationErrorSummary
                        errorsExist={detailsFormErrorsExist}
                    />
                }
                toolbar={
                    <EntityToolbar
                        GenerateButton={
                            <CaptureGenerateButton
                                disabled={!hasConnectors}
                                callFailed={helpers.callFailed}
                                subscription={discoversSubscription}
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
                                materialize={handlers.materializeCollections}
                                logEvent={CustomEvents.CAPTURE_EDIT}
                            />
                        }
                    />
                }
            />
        </PageContainer>
    );
}

export default CaptureEdit;
