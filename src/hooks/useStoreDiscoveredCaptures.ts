import type { Entity } from 'src/types';
import type { SupabaseConfig } from 'src/utils/workflow-utils';

import { useCallback } from 'react';

import { getDraftSpecsBySpecType } from 'src/api/draftSpecs';
import {
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import { useEntityWorkflow } from 'src/context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_evaluateDiscoveredBindings } from 'src/stores/Binding/hooks';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEndpointConfigStore_setEncryptedEndpointConfig } from 'src/stores/EndpointConfig/hooks';
import {
    modifyDiscoveredDraftSpec,
    NEW_TASK_PUBLICATION_ID,
} from 'src/utils/workflow-utils';

function useStoreDiscoveredCaptures() {
    const [lastPubId] = useGlobalSearchParams([GlobalSearchParams.LAST_PUB_ID]);

    const workflow = useEntityWorkflow();
    const editWorkflow =
        workflow === 'capture_edit' || workflow === 'materialization_edit';

    // Binding Store
    const evaluateDiscoveredCollections =
        useBinding_evaluateDiscoveredBindings();

    // Draft Editor Store
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();
    const setDraftId = useEditorStore_setId();

    // Details Form Store
    const entityName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );

    // Endpoint Config Store
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();

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
                const supabaseConfig: SupabaseConfig =
                    editWorkflow && lastPubId
                        ? { catalogName: entityName, lastPubId }
                        : {
                              lastPubId: NEW_TASK_PUBLICATION_ID,
                          };

                // Skip this section if in the create workflow AND skipDraftUpdate is set
                // This check was added a long time after this function initially was written so wanted to keep the
                //   scope as small as possible. Generally, this will happen when a use is editing their
                //   capture and trying to fire off a refresh directly after updating the form
                if (!editWorkflow && !skipDraftUpdate) {
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

                logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                    newValue: newDraftId,
                    component: 'useStoreDiscoveredCaptures',
                });
                setDraftId(newDraftId);
                setPersistedDraftId(newDraftId);
            }
        },
        [
            editWorkflow,
            entityName,
            evaluateDiscoveredCollections,
            lastPubId,
            setDraftId,
            setEncryptedEndpointConfig,
            setPersistedDraftId,
        ]
    );

    return storeDiscoveredCollections;
}

export default useStoreDiscoveredCaptures;
