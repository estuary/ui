import { generateCaptureDraftSpec, updateDraftSpec } from 'api/draftSpecs';
import { authenticatedRoutes } from 'app/Authenticated';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import {
    useEditorStore_id,
    useEditorStore_pubId,
    useEditorStore_setId,
} from 'components/editor/Store';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import EntityToolbar from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import PageContainer from 'components/shared/PageContainer';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
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

const trackEvent = (payload: any) => {
    LogRocket.track(CustomEvents.CAPTURE_DISCOVER, {
        name: payload.capture_name ?? DEFAULT_FILTER,
        id: payload.id ?? DEFAULT_FILTER,
        draft_id: payload.draft_id ?? DEFAULT_FILTER,
        logs_token: payload.logs_token ?? DEFAULT_FILTER,
        status: payload.job_status?.type ?? DEFAULT_FILTER,
    });
};

function CaptureCreate() {
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

    const pubId = useEditorStore_pubId();

    // Endpoint Config Store
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

    // Reset the catalog if the connector changes
    useEffect(() => {
        setDraftId(null);
    }, [imageTag, setDraftId]);

    const resetState = () => {
        resetDetailsForm();
        resetEndpointConfigState();
        resetResourceConfigState();
        resetFormState();
    };

    const helpers = {
        callFailed: (formState: any) => {
            setFormState({
                status: FormStatus.FAILED,
                exitWhenLogsClose: false,
                ...formState,
            });
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

    // TODO (defect): The draft specs array must be propagated and mutated in a similar fashion
    //   as the capture edit workflow. This will allow for the specification editor to be updated
    //   accordingly and accurate determination of a required server update.
    const storeDiscoveredCollections = async (
        newDraftId: string,
        resourceConfig: ResourceConfigDictionary
    ) => {
        // TODO (optimization | typing): Narrow the columns selected from the draft_specs_ext table.
        //   More columns are selected than required to appease the typing of the editor store.
        const draftSpecsResponse = await supabaseClient
            .from(TABLES.DRAFT_SPECS_EXT)
            .select(`catalog_name,draft_id,expect_pub_id,spec,spec_type`)
            .eq('draft_id', newDraftId)
            .eq('spec_type', ENTITY.CAPTURE)
            .then(handleSuccess<DraftSpecQuery[]>, handleFailure);

        if (draftSpecsResponse.error) {
            return helpers.callFailed({
                error: {
                    title: 'captureEdit.generate.failedErrorTitle',
                    error: draftSpecsResponse.error,
                },
            });
        }

        if (draftSpecsResponse.data && draftSpecsResponse.data.length > 0) {
            const mergedResourceConfig = {};

            Object.entries(resourceConfig).forEach(([key, value]) => {
                mergedResourceConfig[key] = value;
            });

            const existingCollections = Object.keys(resourceConfig);

            const discoveredDraftSpecData = draftSpecsResponse.data[0];

            discoveredDraftSpecData.spec.bindings.forEach((binding: any) => {
                if (!existingCollections.includes(binding.target)) {
                    mergedResourceConfig[binding.target] = {
                        data: binding.resource,
                        errors: [],
                    };
                }
            });

            const mergedDraftSpec = generateCaptureDraftSpec(
                mergedResourceConfig,
                discoveredDraftSpecData.spec.endpoint
            );

            const updatedDraftSpecsResponse = await updateDraftSpec(
                newDraftId,
                discoveredDraftSpecData.catalog_name,
                mergedDraftSpec
            );
            if (updatedDraftSpecsResponse.error) {
                return helpers.callFailed({
                    error: {
                        title: 'captureCreate.generate.failure.errorTitle',
                        error: draftSpecsResponse.error,
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
            }
        }
    };

    // TODO (optimization): Create a shared discovers table subscription.
    const discoversSubscription = (
        discoverDraftId: string,
        _existingEndpointConfig: JsonFormsData,
        resourceConfig: ResourceConfigDictionary
    ) => {
        setDraftId(null);
        jobStatusPoller(
            supabaseClient
                .from(TABLES.DISCOVERS)
                .select(
                    `
                    draft_id,
                    job_status
                `
                )
                .match({
                    draft_id: discoverDraftId,
                }),
            (payload: any) => {
                setDraftId(payload.draft_id);

                void storeDiscoveredCollections(
                    payload.draft_id,
                    resourceConfig
                );

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
        <PageContainer
            pageTitleProps={{
                header: authenticatedRoutes.captures.create.title,
                headerLink:
                    'https://docs.estuary.dev/guides/create-dataflow/#create-a-capture',
            }}
        >
            <ResourceConfigHydrator>
                <EntityCreate
                    title="browserTitle.captureCreate"
                    connectorType={entityType}
                    showCollections
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
                                    logEvent={CustomEvents.CAPTURE_CREATE}
                                />
                            }
                        />
                    }
                />
            </ResourceConfigHydrator>
        </PageContainer>
    );
}

export default CaptureCreate;
