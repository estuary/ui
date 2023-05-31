import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
import {
    DraftSpecsExtQuery_ByCatalogName,
    getDraftSpecsByCatalogName,
} from 'api/draftSpecs';
import {
    useEditorStore_isSaving,
    useEditorStore_persistedDraftId,
    useEditorStore_resetState,
    useEditorStore_setDiscoveredDraftId,
    useEditorStore_setId,
} from 'components/editor/Store/hooks';
import { useClient } from 'hooks/supabase-swr';
import useEntityNameSuffix from 'hooks/useEntityNameSuffix';
import useStoreDiscoveredCaptures from 'hooks/useStoreDiscoveredCaptures';
import { useCallback, useMemo } from 'react';
import { CustomEvents, logRocketEvent } from 'services/logrocket';
import {
    DEFAULT_FILTER,
    DEFAULT_POLLER_ERROR,
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
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_resourceConfig,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig/hooks';
import { Entity } from 'types';
import { encryptEndpointConfig } from 'utils/sops-utils';
import { modifyExistingCaptureDraftSpec } from 'utils/workflow-utils';

const trackEvent = (payload: any) => {
    logRocketEvent(CustomEvents.CAPTURE_DISCOVER, {
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

    // Draft Editor Store
    const persistedDraftId = useEditorStore_persistedDraftId();
    const setDraftId = useEditorStore_setId();
    const setDiscoveredDraftId = useEditorStore_setDiscoveredDraftId();

    const isSaving = useEditorStore_isSaving();
    const resetEditorState = useEditorStore_resetState();

    // Form State Store
    const formActive = useFormStateStore_isActive();
    const setFormState = useFormStateStore_setFormState();
    const updateFormStatus = useFormStateStore_updateStatus();

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
    const resourceConfigHasErrors =
        useResourceConfig_resourceConfigErrorsExist();

    const storeDiscoveredCollections = useStoreDiscoveredCaptures();

    // If we are doing an initial discovery add the name name to the name
    // If not we are either refreshing collections during create OR during edit
    //  Refreshing during:
    //    create requires draftedEntityName because it has the connector image added to it
    //    edit   requires entityName        because it is the name already in the system and
    //                                        we do not have a draftedEntityName yet
    const processedEntityName = useEntityNameSuffix(options?.initiateDiscovery);

    const jobFailed = useCallback(
        (error) => {
            setFormState({
                error,
                status: FormStatus.FAILED,
            });
        },
        [setFormState]
    );

    const createDiscoversSubscription = useCallback(
        (
            discoverDraftId: string,
            existingEndpointConfig: any // JsonFormsData,
        ) => {
            setDraftId(null);
            setDiscoveredDraftId(discoverDraftId);

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
                        entityType,
                        callFailed
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
                        jobFailed(DEFAULT_POLLER_ERROR);
                    } else {
                        jobFailed({
                            title: 'discovery.failed.title',
                            error: {
                                message: 'discovery.failed.message',
                            },
                        });
                    }
                }
            );
        },
        [
            callFailed,
            entityType,
            jobFailed,
            postGenerateMutate,
            setDiscoveredDraftId,
            setDraftId,
            setDraftedEntityName,
            setFormState,
            setPreviousEndpointConfig,
            storeDiscoveredCollections,
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
                    const draftsResponse = await createEntityDraft(
                        processedEntityName
                    );
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
                        processedEntityName,
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
                    createDiscoversSubscription(draftId, endpointConfigData);

                    setFormState({
                        logToken: discoverResponse.data[0].logs_token,
                    });
                } else if (persistedDraftId) {
                    const existingDraftSpecResponse =
                        await getDraftSpecsByCatalogName(
                            persistedDraftId,
                            entityName,
                            'capture'
                        );

                    if (existingDraftSpecResponse.error) {
                        return callFailed({
                            error: {
                                title: 'captureCreate.generate.failedErrorTitle',
                                error: existingDraftSpecResponse.error,
                            },
                        });
                    }

                    const existingTaskData: DraftSpecsExtQuery_ByCatalogName | null =
                        existingDraftSpecResponse.data &&
                        existingDraftSpecResponse.data.length > 0
                            ? existingDraftSpecResponse.data[0]
                            : null;

                    const draftSpecsResponse =
                        await modifyExistingCaptureDraftSpec(
                            persistedDraftId,
                            imagePath,
                            encryptedEndpointConfig.data,
                            resourceConfig,
                            existingTaskData
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
            updateFormStatus,
            detailsFormsHasErrors,
            endpointConfigErrorsExist,
            resourceConfigHasErrors,
            setFormState,
            resetEditorState,
            serverUpdateRequired,
            endpointConfigData,
            serverEndpointConfigData,
            endpointSchema,
            imageConnectorId,
            imageConnectorTagId,
            callFailed,
            options?.initiateRediscovery,
            options?.initiateDiscovery,
            persistedDraftId,
            processedEntityName,
            createDiscoversSubscription,
            entityName,
            imagePath,
            resourceConfig,
            setEncryptedEndpointConfig,
            setPreviousEndpointConfig,
            setDraftId,
            postGenerateMutate,
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
