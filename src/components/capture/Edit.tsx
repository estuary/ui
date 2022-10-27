import { RealtimeSubscription } from '@supabase/supabase-js';
import { getDraftSpecsBySpecType } from 'api/draftSpecs';
import { authenticatedRoutes } from 'app/Authenticated';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import {
    useEditorStore_editDraftId,
    useEditorStore_id,
    useEditorStore_pubId,
    useEditorStore_resetState,
    useEditorStore_setEditDraftId,
    useEditorStore_setId,
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
import useDraftSpecs from 'hooks/useDraftSpecs';
import LogRocket from 'logrocket';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomEvents } from 'services/logrocket';
import {
    DEFAULT_FILTER,
    jobStatusPoller,
    JOB_STATUS_POLLER_ERROR,
    TABLES,
} from 'services/supabase';
import {
    useDetailsForm_connectorImage,
    useDetailsForm_errorsExist,
    useDetailsForm_resetState,
} from 'stores/DetailsForm';
import {
    useEndpointConfigStore_reset,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
} from 'stores/EndpointConfig';
import {
    FormStatus,
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_messagePrefix,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState';
import {
    ResourceConfigDictionary,
    ResourceConfigHydrator,
    useResourceConfig_addCollection,
    useResourceConfig_resetState,
    useResourceConfig_setCurrentCollection,
    useResourceConfig_setResourceConfig,
} from 'stores/ResourceConfig';
import { ENTITY, JsonFormsData } from 'types';
import { getPathWithParams } from 'utils/misc-utils';
import { modifyDiscoveredDraftSpec } from 'utils/workflow-utils';

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
    const setEditDraftId = useEditorStore_setEditDraftId();

    const pubId = useEditorStore_pubId();

    const resetEditorStore = useEditorStore_resetState();

    // Endpoint Config Store
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();

    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();

    const resetEndpointConfigState = useEndpointConfigStore_reset();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Resource Config Store
    const addCollection = useResourceConfig_addCollection();
    const setCurrentCollection = useResourceConfig_setCurrentCollection();

    const setResourceConfig = useResourceConfig_setResourceConfig();

    const resetResourceConfigState = useResourceConfig_resetState();

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
        resetResourceConfigState();
        resetFormState();
        resetEditorStore();
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

    const storeUpdatedDraftSpec = async (
        newDraftId: string,
        resourceConfig: ResourceConfigDictionary
    ) => {
        const draftSpecsResponse = await getDraftSpecsBySpecType(
            newDraftId,
            entityType
        );

        if (draftSpecsResponse.error) {
            return helpers.callFailed({
                error: {
                    title: 'captureEdit.generate.failedErrorTitle',
                    error: draftSpecsResponse.error,
                },
            });
        }

        if (draftSpecsResponse.data && draftSpecsResponse.data.length > 0) {
            const existingCollections = Object.keys(resourceConfig);

            const updatedDraftSpecsResponse = await modifyDiscoveredDraftSpec(
                draftSpecsResponse,
                resourceConfig,
                existingCollections,
                lastPubId
            );

            if (updatedDraftSpecsResponse.error) {
                return helpers.callFailed({
                    error: {
                        title: 'captureEdit.generate.failedErrorTitle',
                        error: updatedDraftSpecsResponse.error,
                    },
                });
            }

            if (
                updatedDraftSpecsResponse.data &&
                updatedDraftSpecsResponse.data.length > 0
            ) {
                const updatedBindings =
                    updatedDraftSpecsResponse.data[0].spec.bindings;

                updatedBindings.forEach((binding: any) => {
                    if (!existingCollections.includes(binding.target)) {
                        addCollection(binding.target);

                        setResourceConfig(binding.target, {
                            data: binding.resource,
                            errors: [],
                        });
                    }
                });

                setCurrentCollection(updatedBindings[0].target);

                setEncryptedEndpointConfig(
                    {
                        data: updatedDraftSpecsResponse.data[0].spec.endpoint
                            .connector.config,
                    },
                    'capture_edit'
                );
            }
        }

        setDraftId(newDraftId);
        setEditDraftId(newDraftId);
    };

    const discoversSubscription = (
        discoverDraftId: string,
        existingEndpointConfig: JsonFormsData,
        resourceConfig: ResourceConfigDictionary
    ) => {
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
                void storeUpdatedDraftSpec(payload.draft_id, resourceConfig);

                void mutateDraftSpecs();

                setPreviousEndpointConfig({ data: existingEndpointConfig });

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
            <ResourceConfigHydrator>
                <EntityEdit
                    title="browserTitle.captureEdit"
                    entityType={entityType}
                    readOnly={{ detailsForm: true }}
                    draftSpecMetadata={draftSpecsMetadata}
                    showCollections
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
                                    materialize={
                                        handlers.materializeCollections
                                    }
                                    logEvent={CustomEvents.CAPTURE_EDIT}
                                />
                            }
                        />
                    }
                />
            </ResourceConfigHydrator>
        </PageContainer>
    );
}

export default CaptureEdit;
