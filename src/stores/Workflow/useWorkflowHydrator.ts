import type { EntityWithCreateWorkflow } from 'src/types';

import { useCallback } from 'react';

import { useConnectorTag } from 'src/context/ConnectorTag';
import { useEntityType } from 'src/context/EntityContext';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { useGetDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useGetLiveSpec } from 'src/hooks/tasks/useGetLiveSpec';
import { logRocketConsole } from 'src/services/shared';
import { useDetailsFormHydrator } from 'src/stores/DetailsForm/useDetailsFormHydrator';
import { useEndpointConfigHydrator } from 'src/stores/EndpointConfig/useEndpointConfigHydrator';
import { useEntitiesStore } from 'src/stores/Entities/Store';
import { useWorkflowStore } from 'src/stores/Workflow/Store';
import { normalizeError } from 'src/utils/errors';

export const useWorkflowHydrator = () => {
    const draftId = useGlobalSearchParams(GlobalSearchParams.DRAFT_ID);
    const liveSpecId = useGlobalSearchParams(GlobalSearchParams.LIVE_SPEC_ID);
    const connectorTag = useConnectorTag();

    const { hydrateDetailsForm } = useDetailsFormHydrator();
    const { hydrateEndpointConfig } = useEndpointConfigHydrator();

    const baseCatalogPrefix = useEntitiesStore((state) => {
        const storageMappingPrefixes = Object.keys(state.storageMappings);

        return storageMappingPrefixes.length === 1
            ? storageMappingPrefixes[0]
            : undefined;
    });

    const isEditWorkflow = useEntityWorkflow_Editing();
    const fetchWorkflowData = useFetchWorkflowData();

    const setConnectorMetadata = useWorkflowStore(
        (state) => state.setConnectorMetadata
    );
    const setHydrated = useWorkflowStore((state) => state.setHydrated);
    const setHydrationError = useWorkflowStore(
        (state) => state.setHydrationError
    );
    const setHydrationErrorsExist = useWorkflowStore(
        (state) => state.setHydrationErrorsExist
    );

    return useCallback(async () => {
        setConnectorMetadata(connectorTag);

        try {
            const { draftSpec, liveSpec } = await fetchWorkflowData(
                draftId,
                liveSpecId
            );

            // if editing, then we expect a draft
            if (isEditWorkflow && draftId && !draftSpec) {
                throw new Error('Draft spec not found');
            }
            const spec = draftSpec?.spec ?? liveSpec?.spec ?? null;
            if (isEditWorkflow && !spec) {
                throw new Error('Spec not found');
            }

            await hydrateDetailsForm(baseCatalogPrefix, liveSpec);
            await hydrateEndpointConfig(spec);
            setHydrated(true);
        } catch (error: unknown) {
            setHydrated(true);
            setHydrationErrorsExist(true);
            setHydrationError(
                error instanceof Error
                    ? error.message
                    : 'Failed to hydrate workflow'
            );
            logRocketConsole('Failed to hydrate workflow', error);
        }
    }, [
        baseCatalogPrefix,
        connectorTag,
        draftId,
        fetchWorkflowData,
        hydrateDetailsForm,
        hydrateEndpointConfig,
        isEditWorkflow,
        liveSpecId,
        setConnectorMetadata,
        setHydrated,
        setHydrationError,
        setHydrationErrorsExist,
    ]);
};

function useFetchWorkflowData() {
    const entityType = useEntityType() as EntityWithCreateWorkflow;
    const getLiveSpec = useGetLiveSpec(entityType);
    const getDraftSpec = useGetDraftSpec(entityType);

    return useCallback(
        async (draftId: string, liveSpecId: string) => {
            const [draftSpecRes, liveSpecRes] = await Promise.all([
                getDraftSpec(draftId),
                getLiveSpec(liveSpecId),
            ]);
            if (draftSpecRes.error) {
                throw normalizeError(draftSpecRes.error);
            }
            if (liveSpecRes.error) {
                throw normalizeError(liveSpecRes.error);
            }

            const draftSpec = draftSpecRes.value;
            const liveSpec = liveSpecRes.value;
            return { draftSpec, liveSpec };
        },
        [getDraftSpec, getLiveSpec]
    );
}
