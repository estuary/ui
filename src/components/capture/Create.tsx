import { getDraftSpecsBySpecType } from 'api/draftSpecs';
import { authenticatedRoutes } from 'app/routes';
import CaptureGenerateButton from 'components/capture/GenerateButton';
import {
    useEditorStore_id,
    useEditorStore_persistedDraftId,
    useEditorStore_pubId,
    useEditorStore_resetState,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import EntitySaveButton from 'components/shared/Entity/Actions/SaveButton';
import EntityTestButton from 'components/shared/Entity/Actions/TestButton';
import EntityCreate from 'components/shared/Entity/Create';
import EntityToolbar from 'components/shared/Entity/Header';
import ValidationErrorSummary from 'components/shared/Entity/ValidationErrorSummary';
import PageContainer from 'components/shared/PageContainer';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import useConnectorWithTagDetail from 'hooks/useConnectorWithTagDetail';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { isEmpty } from 'lodash';
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
import { useEndpointConfigStore_reset } from 'stores/EndpointConfig';
import {
    useFormStateStore_exitWhenLogsClose,
    useFormStateStore_messagePrefix,
    useFormStateStore_resetState,
    useFormStateStore_setFormState,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_evaluateDiscoveredCollections,
    useResourceConfig_resetState,
    useResourceConfig_restrictedDiscoveredCollections,
    useResourceConfig_setDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import ResourceConfigHydrator from 'stores/ResourceConfig/Hydrator';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import { JsonFormsData } from 'types';
import { getPathWithParams } from 'utils/misc-utils';
import {
    getBoundCollectionData,
    modifyDiscoveredCollectionDraftSpecs,
    modifyDiscoveredDraftSpec,
} from 'utils/workflow-utils';

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

    const entityType = 'capture';

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

    const persistedDraftId = useEditorStore_persistedDraftId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

    const pubId = useEditorStore_pubId();

    const resetEditorStore = useEditorStore_resetState();

    // Endpoint Config Store
    const resetEndpointConfigState = useEndpointConfigStore_reset();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();
    const setFormState = useFormStateStore_setFormState();
    const resetFormState = useFormStateStore_resetState();
    const exitWhenLogsClose = useFormStateStore_exitWhenLogsClose();

    // Resource Config Store
    const restrictedDiscoveredCollections =
        useResourceConfig_restrictedDiscoveredCollections();

    const setDiscoveredCollections =
        useResourceConfig_setDiscoveredCollections();

    const evaluateDiscoveredCollections =
        useResourceConfig_evaluateDiscoveredCollections();

    const resetResourceConfigState = useResourceConfig_resetState();

    const { mutate: mutateDraftSpecs, ...draftSpecsMetadata } =
        useDraftSpecs(persistedDraftId);

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

    const propagateDraftCollections = async (
        newDraftId: string,
        previousDraftId: string,
        boundCollections: string[]
    ) => {
        const draftSpecsResponse = await getDraftSpecsBySpecType(
            previousDraftId,
            'collection'
        );

        if (draftSpecsResponse.error) {
            return helpers.callFailed({
                error: {
                    title: 'captureEdit.generate.failedErrorTitle',
                    error: draftSpecsResponse.error,
                },
            });
        }

        const collectionData = getBoundCollectionData(
            boundCollections,
            draftSpecsResponse.data ?? [],
            []
        );

        if (!isEmpty(collectionData)) {
            const updatedDraftSpecsPromises =
                await modifyDiscoveredCollectionDraftSpecs(
                    newDraftId,
                    collectionData,
                    'captureEdit.generate.failedErrorTitle',
                    helpers.callFailed
                );

            if (updatedDraftSpecsPromises) {
                const updatedDraftSpecsResponse = await Promise.all(
                    updatedDraftSpecsPromises
                );

                const updatedDraftSpecsErrors =
                    updatedDraftSpecsResponse.filter(
                        (response) => response.error
                    );

                if (updatedDraftSpecsErrors.length > 0) {
                    return helpers.callFailed({
                        error: {
                            title: 'captureEdit.generate.failedErrorTitle',
                            error: updatedDraftSpecsErrors,
                        },
                    });
                }
            }
        }
    };

    const storeDiscoveredCollections = async (
        newDraftId: string,
        resourceConfig: ResourceConfigDictionary
    ) => {
        // TODO (optimization | typing): Narrow the columns selected from the draft_specs_ext table.
        //   More columns are selected than required to appease the typing of the editor store.
        const draftSpecsResponse = await getDraftSpecsBySpecType(
            newDraftId,
            entityType
        );

        if (draftSpecsResponse.error) {
            return helpers.callFailed({
                error: {
                    title: 'captureCreate.generate.failedErrorTitle',
                    error: draftSpecsResponse.error,
                },
            });
        }

        if (draftSpecsResponse.data && draftSpecsResponse.data.length > 0) {
            setDiscoveredCollections(draftSpecsResponse.data[0]);

            const updatedDraftSpecsResponse = await modifyDiscoveredDraftSpec(
                draftSpecsResponse,
                resourceConfig,
                restrictedDiscoveredCollections
            );
            if (updatedDraftSpecsResponse.error) {
                return helpers.callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: updatedDraftSpecsResponse.error,
                    },
                });
            }

            if (
                updatedDraftSpecsResponse.data &&
                updatedDraftSpecsResponse.data.length > 0
            ) {
                evaluateDiscoveredCollections(updatedDraftSpecsResponse);
            }
        }

        setDraftId(newDraftId);
        setPersistedDraftId(newDraftId);
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
            async (payload: any) => {
                const boundCollections = Object.keys(resourceConfig);

                if (boundCollections.length > 0 && persistedDraftId) {
                    await propagateDraftCollections(
                        payload.draft_id,
                        persistedDraftId,
                        boundCollections
                    );
                }

                await storeDiscoveredCollections(
                    payload.draft_id,
                    resourceConfig
                );

                void mutateDraftSpecs();

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
                    entityType={entityType}
                    draftSpecMetadata={draftSpecsMetadata}
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
