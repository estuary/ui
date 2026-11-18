import type { PostgrestError } from '@supabase/postgrest-js';
import type { EntityWithCreateWorkflow, Schema } from 'src/types';
import type { Result } from 'src/types/utils';

import { useCallback } from 'react';

import {
    useEditorStore_setId,
    useEditorStore_setPersistedDraftId,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { useGetDraftSpec } from 'src/hooks/drafts/useGetDraftSpec';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_evaluateDiscoveredBindings } from 'src/stores/Binding/hooks';
import { useEndpointConfigStore_setEncryptedEndpointConfig } from 'src/stores/EndpointConfig/hooks';
import { getEndpointFromSpecDef } from 'src/utils/connector-utils';

/**
 * Callback hook that reloads the workflow's task from its draft after the
 * backend rewrote it, as a discover or an evolution does. The bindings are
 * rebuilt from the drafted ones, and the workflow is pointed at the draft.
 * Callers report a failure, as each fails its form differently.
 */
export function useReloadDraftedTask() {
    const entityType = useEntityType() as EntityWithCreateWorkflow;
    const getDraftSpec = useGetDraftSpec(entityType);

    const evaluateDiscoveredBindings = useBinding_evaluateDiscoveredBindings();
    const setDraftId = useEditorStore_setId();
    const setPersistedDraftId = useEditorStore_setPersistedDraftId();
    const setEncryptedEndpointConfig =
        useEndpointConfigStore_setEncryptedEndpointConfig();

    return useCallback(
        async (
            draftId: string,
            catalogName: string
        ): Promise<Result<null, Error | PostgrestError>> => {
            const { value: draftSpec, error } = await getDraftSpec(
                draftId,
                catalogName
            );

            if (error) {
                return { error };
            }
            if (!draftSpec) {
                return {
                    error: new Error(`${catalogName} is not in the draft`),
                };
            }

            const spec = draftSpec.spec;
            const endpoint = getEndpointFromSpecDef(spec);
            const endpointConfig = endpoint?.config as Schema;

            setDraftId(draftId);
            setPersistedDraftId(draftId);
            // TODO: update these to use strong types
            evaluateDiscoveredBindings(spec.bindings);
            setEncryptedEndpointConfig({ data: endpointConfig });

            logRocketEvent(CustomEvents.DRAFT_ID_SET, {
                newValue: draftId,
                component: 'useReloadDraftedTask',
            });

            return { value: null };
        },
        [
            evaluateDiscoveredBindings,
            getDraftSpec,
            setDraftId,
            setEncryptedEndpointConfig,
            setPersistedDraftId,
        ]
    );
}
