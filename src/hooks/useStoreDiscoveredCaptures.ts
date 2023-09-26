import { getDraftSpecsBySpecType } from 'api/draftSpecs';
import {
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'components/editor/Store/hooks';
import { useEntityWorkflow } from 'context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback } from 'react';
import { useDetailsForm_details_entityName } from 'stores/DetailsForm/hooks';
import { useEndpointConfigStore_setEncryptedEndpointConfig } from 'stores/EndpointConfig/hooks';
import {
    useResourceConfig_evaluateDiscoveredCollections,
    useResourceConfig_resetConfigAndCollections,
    useResourceConfig_setDiscoveredCollections,
} from 'stores/ResourceConfig/hooks';
import { Entity } from 'types';
import {
    modifyDiscoveredDraftSpec,
    SupabaseConfig,
} from 'utils/workflow-utils';

function useStoreDiscoveredCaptures() {
    const [lastPubId] = useGlobalSearchParams([GlobalSearchParams.LAST_PUB_ID]);

    const workflow = useEntityWorkflow();
    const editWorkflow = workflow === 'capture_edit';

    // Draft Editor Store
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();
    const setDraftId = useEditorStore_setId();

    // Details Form Store
    const entityName = useDetailsForm_details_entityName();

    // Endpoint Config Store
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();

    // Resource Config Store
    const setDiscoveredCollections =
        useResourceConfig_setDiscoveredCollections();
    const evaluateDiscoveredCollections =
        useResourceConfig_evaluateDiscoveredCollections();
    const resetCollections = useResourceConfig_resetConfigAndCollections();

    const storeDiscoveredCollections = useCallback(
        async (
            newDraftId: string,
            entityType: Entity,
            callFailed: any,
            skipDraftUpdate?: boolean
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
                resetCollections();

                setDiscoveredCollections(draftSpecsResponse.data[0]);

                const supabaseConfig: SupabaseConfig | null =
                    editWorkflow && lastPubId
                        ? { catalogName: entityName, lastPubId }
                        : null;

                // Skip this section if the setting is set AND we don't have the config stuff
                // This check was added a long time after this function initially was written so wanted to keep the
                //   scope as small as possible. Generally, this will happen when a use is editing their
                //   capture and trying to fire off a refresh directly after updating the form
                if (!supabaseConfig && !skipDraftUpdate) {
                    const updatedDraftSpecsResponse =
                        await modifyDiscoveredDraftSpec(
                            draftSpecsResponse,
                            supabaseConfig
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
                        evaluateDiscoveredCollections(
                            updatedDraftSpecsResponse
                        );

                        setEncryptedEndpointConfig({
                            data: updatedDraftSpecsResponse.data[0].spec
                                .endpoint.connector.config,
                        });
                    }
                } else {
                    evaluateDiscoveredCollections(draftSpecsResponse);

                    setEncryptedEndpointConfig({
                        data: draftSpecsResponse.data[0].spec.endpoint.connector
                            .config,
                    });
                }

                setDraftId(newDraftId);
                setPersistedDraftId(newDraftId);
            }
        },
        [
            editWorkflow,
            entityName,
            evaluateDiscoveredCollections,
            lastPubId,
            resetCollections,
            setDiscoveredCollections,
            setDraftId,
            setEncryptedEndpointConfig,
            setPersistedDraftId,
        ]
    );

    return storeDiscoveredCollections;
}

export default useStoreDiscoveredCaptures;
