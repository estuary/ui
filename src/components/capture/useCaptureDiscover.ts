import { discover } from 'api/discovers';
import { createEntityDraft } from 'api/drafts';
import { getDraftSpecsBySpecType } from 'api/draftSpecs';
import {
    useEditorStore_isSaving,
    useEditorStore_resetState,
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { useEntityWorkflow } from 'context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useClient } from 'hooks/supabase-swr';
import { isEmpty } from 'lodash';
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
    useDetailsForm_details_entityName,
    useDetailsForm_errorsExist,
    useDetailsForm_setDraftedEntityName,
} from 'stores/DetailsForm';
import {
    useEndpointConfigStore_encryptedEndpointConfig_data,
    useEndpointConfigStore_endpointConfig_data,
    useEndpointConfigStore_endpointSchema,
    useEndpointConfigStore_errorsExist,
    useEndpointConfigStore_setEncryptedEndpointConfig,
    useEndpointConfigStore_setPreviousEndpointConfig,
    useEndpointConfig_serverUpdateRequired,
} from 'stores/EndpointConfig';
import {
    useFormStateStore_isActive,
    useFormStateStore_messagePrefix,
    useFormStateStore_setFormState,
    useFormStateStore_updateStatus,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import {
    useResourceConfig_evaluateDiscoveredCollections,
    useResourceConfig_resourceConfig,
    useResourceConfig_resourceConfigErrorsExist,
    useResourceConfig_restrictedDiscoveredCollections,
    useResourceConfig_setDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import { ResourceConfigDictionary } from 'stores/ResourceConfig/types';
import { Entity } from 'types';
import { encryptEndpointConfig } from 'utils/sops-utils';
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

function useCaptureDiscover(
    entityType: Entity,
    disabled: boolean,
    callFailed: Function,
    postGenerateMutate: Function
) {
    const supabaseClient = useClient();

    const initialConnectorId = useGlobalSearchParams(
        GlobalSearchParams.CONNECTOR_ID
    );

    const workflow = useEntityWorkflow();
    const editWorkflow = workflow === 'capture_edit';

    // Draft Editor Store
    const setDraftId = useEditorStore_setId();

    // Editor Store
    const isSaving = useEditorStore_isSaving();
    const resetEditorState = useEditorStore_resetState();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();

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

    const endpointConfigErrorFlag = editWorkflow
        ? endpointConfigErrorsExist
        : endpointConfigErrorsExist || isEmpty(endpointConfigData);

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
                setDiscoveredCollections(draftSpecsResponse.data[0]);

                const updatedDraftSpecsResponse =
                    await modifyDiscoveredDraftSpec(
                        draftSpecsResponse,
                        resourceConfigForDiscovery,
                        restrictedDiscoveredCollections
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
            }

            setDraftId(newDraftId);
            setPersistedDraftId(newDraftId);
        },
        [
            callFailed,
            entityType,
            evaluateDiscoveredCollections,
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

    const discoversSubscription = useCallback(
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
                    job_status
                `
                    )
                    .match({
                        draft_id: discoverDraftId,
                    }),
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
            messagePrefix,
            postGenerateMutate,
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
                endpointConfigErrorFlag ||
                resourceConfigHasErrors
            ) {
                return setFormState({
                    status: FormStatus.FAILED,
                    displayValidation: true,
                });
            } else {
                resetEditorState(true);

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

                let catalogName = entityName;

                if (editWorkflow && imageConnectorId === initialConnectorId) {
                    // The discovery RPC will insert a row into the draft spec-related tables for the given task with verbiage
                    // identifying the external source appended to the task name (e.g., '/source-postgres'). To limit duplication
                    // of draft spec-related data, the aforementioned external source identifier is removed from the task name
                    // prior to executing the discovery RPC.
                    const lastSlashIndex = entityName.lastIndexOf('/');

                    if (lastSlashIndex !== -1) {
                        catalogName = entityName.slice(0, lastSlashIndex);
                    }
                }

                const discoverResponse = await discover(
                    catalogName,
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
                discoversSubscription(
                    draftId,
                    endpointConfigData,
                    resourceConfig
                );

                setFormState({
                    logToken: discoverResponse.data[0].logs_token,
                });
            }
        },
        [
            callFailed,
            detailsFormsHasErrors,
            discoversSubscription,
            editWorkflow,
            endpointConfigData,
            endpointConfigErrorFlag,
            endpointSchema,
            entityName,
            imageConnectorId,
            imageConnectorTagId,
            initialConnectorId,
            resetEditorState,
            resourceConfig,
            resourceConfigHasErrors,
            serverEndpointConfigData,
            serverUpdateRequired,
            setFormState,
            updateFormStatus,
        ]
    );

    return useMemo(() => {
        return {
            isSaving,
            formActive,
            generateCatalog,
            discoversSubscription,
        };
    }, [formActive, generateCatalog, isSaving, discoversSubscription]);
}

export default useCaptureDiscover;
