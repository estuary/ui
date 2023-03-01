import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
import { getDraftSpecsBySpecType } from 'api/draftSpecs';
import {
    useEditorStore_isSaving,
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { useEntityWorkflow } from 'context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import LogRocket from 'logrocket';
import { useCallback, useMemo } from 'react';
import { CustomEvents } from 'services/logrocket';
import {
    DEFAULT_FILTER,
    jobStatusPoller,
    JOB_STATUS_POLLER_ERROR,
    TABLES,
} from 'services/supabase';
import {
    useDetailsForm_connectorImage_connectorId,
    useDetailsForm_connectorImage_id,
    useDetailsForm_connectorImage_imagePath,
    useDetailsForm_details_entityName,
    useDetailsForm_errorsExist,
    useDetailsForm_setDraftedEntityName,
} from 'stores/DetailsForm/hooks';
import {
    useEndpointConfigStore_encryptedEndpointConfig_data,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig/hooks';
import {
    useFormStateStore_isActive,
    useFormStateStore_messagePrefix,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_evaluateDiscoveredCollections,
    useResourceConfig_resetConfigAndCollections,
    useResourceConfig_resourceConfig,
    useResourceConfig_resourceConfigErrorsExist,
    useResourceConfig_restrictedDiscoveredCollections,
    useResourceConfig_setDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import { Entity } from 'types';
import { encryptEndpointConfig } from 'utils/sops-utils';
import {
    modifyDiscoveredDraftSpec,
    modifyExistingCaptureDraftSpec,
    SupabaseConfig,
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

function useDiscoverCapture(
    entityType: Entity,
    callFailed: Function,
    postGenerateMutate: Function,
    options?: { initiateRediscovery?: boolean; initiateDiscovery?: boolean }
) {
    const supabaseClient = useClient();

    const [lastPubId] = useGlobalSearchParams([GlobalSearchParams.LAST_PUB_ID]);

    const workflow = useEntityWorkflow();
    const editWorkflow = workflow === 'capture_edit';

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();
    const setDraftId = useEditorStore_setId();

    const isSaving = useEditorStore_isSaving();
    const resetEditorState = useEditorStore_resetState();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();
    const messagePrefix = useFormStateStore_messagePrefix();

    // Details Form Store
    const entityName = useDetailsForm_details_entityName();
    const detailsFormsHasErrors = useDetailsForm_errorsExist();
    const imageConnectorId = useDetailsForm_connectorImage_connectorId();
    const imageConnectorTagId = useDetailsForm_connectorImage_id();
    const imagePath = useDetailsForm_connectorImage_imagePath();
    const setDraftedEntityName = useDetailsForm_setDraftedEntityName();

    // Endpoint Config Store
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();
    const endpointSchema = useEndpointConfigStore_endpointSchema();
    const endpointConfigData = useEndpointConfigStore_endpointConfig_data();
    const serverEndpointConfigData =
        useEndpointConfigStore_encryptedEndpointConfig_data();
    const endpointConfigErrorsExist = useEndpointConfigStore_errorsExist();
    const serverUpdateRequired = useEndpointConfig_serverUpdateRequired();
    const setPreviousEndpointConfig =
        useEndpointConfigStore_setPreviousEndpointConfig();

    // Resource Config Store
    const resourceConfig = useResourceConfig_resourceConfig();
    const restrictedDiscoveredCollections =
        useResourceConfig_restrictedDiscoveredCollections();
    const setDiscoveredCollections =
        useResourceConfig_setDiscoveredCollections();
    const evaluateDiscoveredCollections =
        useResourceConfig_evaluateDiscoveredCollections();
    const resourceConfigHasErrors =
        useResourceConfig_resourceConfigErrorsExist();
    const resetCollections = useResourceConfig_resetConfigAndCollections();

    const storeDiscoveredCollections = useCallback(
        async (
            newDraftId: string,
            resourceConfigForDiscovery: ResourceConfigDictionary
        ) => {
            // TODO (optimization | typing): Narrow the columns selected from the draft_specs_ext table.
            //   More columns are selected than required to appease the typing of the editor store.
            const draftSpecsResponse = await getDraftSpecsBySpecType(
                newDraftId,
                entityType
            );

            if (draftSpecsResponse.error) {
                return callFailed({
                    error: {
                        title: 'captureCreate.generate.failedErrorTitle',
                        error: draftSpecsResponse.error,
                    },
                });
            }

            if (draftSpecsResponse.data && draftSpecsResponse.data.length > 0) {
                if (options?.initiateRediscovery) {
                    resetCollections();
                }

                setDiscoveredCollections(draftSpecsResponse.data[0]);

                const supabaseConfig: SupabaseConfig | null =
                    editWorkflow && lastPubId
                        ? { catalogName: entityName, lastPubId }
                        : null;

                const updatedDraftSpecsResponse =
                    await modifyDiscoveredDraftSpec(
                        draftSpecsResponse,
                        resourceConfigForDiscovery,
                        restrictedDiscoveredCollections,
                        supabaseConfig,
                        options?.initiateRediscovery
                    );

                if (updatedDraftSpecsResponse.error) {
                    return callFailed({
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

                    setEncryptedEndpointConfig({
                        data: updatedDraftSpecsResponse.data[0].spec.endpoint
                            .connector.config,
                    });
                }

                setDraftId(newDraftId);
                setPersistedDraftId(newDraftId);
            }
        },
        [
            callFailed,
            editWorkflow,
            entityName,
            entityType,
            evaluateDiscoveredCollections,
            lastPubId,
            options?.initiateRediscovery,
            resetCollections,
            restrictedDiscoveredCollections,
            setDiscoveredCollections,
            setDraftId,
            setEncryptedEndpointConfig,
            setPersistedDraftId,
        ]
    );

    const jobFailed = useCallback(
        (errorTitle: string) => {
            setFormState({
                error: {
                    title: errorTitle,
                },
                status: FormStatus.FAILED,
            });
        },
        [setFormState]
    );

    const createDiscoversSubscription = useCallback(
        (
            discoverDraftId: string,
            existingEndpointConfig: any, // JsonFormsData,
            resourceConfigForDiscover: ResourceConfigDictionary
        ) => {
            setDraftId(null);

            jobStatusPoller(
                supabaseClient
                    .from(TABLES.DISCOVERS)
                    .select(
                        `
                        capture_name,
                        draft_id,
                        job_status,
                        created_at
                    `
                    )
                    .match({
                        draft_id: discoverDraftId,
                    })
                    .order('created_at', { ascending: false }),
                async (payload: any) => {
                    await storeDiscoveredCollections(
                        payload.draft_id,
                        resourceConfigForDiscover
                    );

                    void postGenerateMutate();

                    setDraftedEntityName(payload.capture_name);

                    setPreviousEndpointConfig({ data: existingEndpointConfig });

                    setFormState({
                        status: FormStatus.GENERATED,
                    });

                    trackEvent(payload);
                },
                (payload: any) => {
                    if (payload.error === JOB_STATUS_POLLER_ERROR) {
                        jobFailed(payload.error);
                    } else {
                        jobFailed(`${messagePrefix}.test.failedErrorTitle`);
                    }
                }
            );
        },
        [
            jobFailed,
            setDraftId,
            setDraftedEntityName,
            setFormState,
            setPreviousEndpointConfig,
            storeDiscoveredCollections,
            messagePrefix,
            postGenerateMutate,
            supabaseClient,
        ]
    );

    const generateCatalog = useCallback(
        async (event: React.MouseEvent<HTMLElement>) => {
            event.preventDefault();
            updateFormStatus(FormStatus.GENERATING);

            if (
                detailsFormsHasErrors ||
                endpointConfigErrorsExist ||
                resourceConfigHasErrors
            ) {
                return setFormState({
                    status: FormStatus.FAILED,
                    displayValidation: true,
                });
            } else {
                resetEditorState(true);

                const selectedEndpointConfig = serverUpdateRequired
                    ? endpointConfigData
                    : serverEndpointConfigData;

                const encryptedEndpointConfig = await encryptEndpointConfig(
                    selectedEndpointConfig,
                    endpointSchema,
                    serverUpdateRequired,
                    imageConnectorId,
                    imageConnectorTagId,
                    callFailed,
                    { overrideJsonFormDefaults: true }
                );

                if (
                    options?.initiateRediscovery ||
                    options?.initiateDiscovery
                ) {
                    const draftsResponse = await createEntityDraft(entityName);
                    if (draftsResponse.error) {
                        return callFailed({
                            error: {
                                title: 'captureCreate.generate.failedErrorTitle',
                                error: draftsResponse.error,
                            },
                        });
                    }

                    const draftId = draftsResponse.data[0].id;

                    const discoverResponse = await discover(
                        entityName,
                        encryptedEndpointConfig.data,
                        imageConnectorTagId,
                        draftId
                    );
                    if (discoverResponse.error) {
                        return callFailed({
                            error: {
                                title: 'captureCreate.generate.failedErrorTitle',
                                error: discoverResponse.error,
                            },
                        });
                    }
                    createDiscoversSubscription(
                        draftId,
                        endpointConfigData,
                        resourceConfig
                    );

                    setFormState({
                        logToken: discoverResponse.data[0].logs_token,
                    });
                } else if (persistedDraftId) {
                    const draftSpecsResponse =
                        await modifyExistingCaptureDraftSpec(
                            persistedDraftId,
                            imagePath,
                            encryptedEndpointConfig.data,
                            resourceConfig
                        );

                    if (draftSpecsResponse.error) {
                        return callFailed({
                            error: {
                                title: 'captureCreate.generate.failedErrorTitle',
                                error: draftSpecsResponse.error,
                            },
                        });
                    }

                    setEncryptedEndpointConfig({
                        data: draftSpecsResponse.data[0].spec.endpoint.connector
                            .config,
                    });

                    setPreviousEndpointConfig({ data: endpointConfigData });

                    setDraftId(persistedDraftId);

                    void postGenerateMutate();

                    setFormState({
                        status: FormStatus.GENERATED,
                    });
                } else {
                    // TODO (optimization): This condition should be nearly impossible to reach, but we currently do not have a means to produce
                    //   an error in this scenario. ValidationErrorSummary is not suitable for this scenario and EntityError, the error component
                    //   that surfaces form state errors, is only rendered in the event a persisted draft ID is present. Since the likelihood of
                    //   reaching this code block is slim, I am going to add a solution in a fast-follow to the schema inference changes.
                }
            }
        },
        [
            callFailed,
            createDiscoversSubscription,
            postGenerateMutate,
            resetEditorState,
            setEncryptedEndpointConfig,
            setFormState,
            setPreviousEndpointConfig,
            setDraftId,
            updateFormStatus,
            detailsFormsHasErrors,
            endpointConfigData,
            endpointConfigErrorsExist,
            endpointSchema,
            entityName,
            imageConnectorId,
            imageConnectorTagId,
            imagePath,
            options?.initiateDiscovery,
            options?.initiateRediscovery,
            persistedDraftId,
            resourceConfig,
            resourceConfigHasErrors,
            serverEndpointConfigData,
            serverUpdateRequired,
        ]
    );

    return useMemo(() => {
        return {
            isSaving,
            formActive,
            generateCatalog,
            discoversSubscription: createDiscoversSubscription,
        };
    }, [createDiscoversSubscription, generateCatalog, formActive, isSaving]);
}

export default useDiscoverCapture;
