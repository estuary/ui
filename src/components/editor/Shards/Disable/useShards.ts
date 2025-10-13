import type { Schema } from 'src/types';

import { useCallback, useMemo } from 'react';

import produce from 'immer';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { isTaskDisabled } from 'src/utils/entity-utils';

function useShards() {
    const taskSpecType = useEntityType();

    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateShards = useCallback(
        async (newShard: Schema) => {
            if (!mutateDraftSpecs || !draftId || draftSpecs.length === 0) {
                console.error(
                    'useShards is missing at least one of: draftId, draft spec, or mutateDraftSpecs function'
                );
                return Promise.resolve();
            }

            // Make sure shards is there to update but do not overwrite any existing settings
            const updateResponse = await modifyDraftSpec(
                produce(draftSpecs[0].spec, (newVal: any) => {
                    newVal.shards ??= {};
                    newVal.shards = {
                        ...newVal.shards,
                        ...newShard,
                    };
                }),
                {
                    draft_id: draftId,
                    catalog_name: draftSpecs[0].catalog_name,
                    spec_type: taskSpecType,
                }
            );

            if (updateResponse.error) {
                return Promise.reject('update failed');
            }

            return mutateDraftSpecs();
        },
        [draftId, draftSpecs, mutateDraftSpecs, taskSpecType]
    );

    const shardDisabled = useMemo(
        () => (draftSpecs[0] ? isTaskDisabled(draftSpecs[0].spec) : false),
        [draftSpecs]
    );

    const updateDisable = useCallback(
        async (newVal: boolean) =>
            updateShards({
                disable: newVal,
            }),
        [updateShards]
    );

    return useMemo(
        () => ({ shardDisabled, updateDisable, updateShards }),
        [shardDisabled, updateDisable, updateShards]
    );
}

export default useShards;
