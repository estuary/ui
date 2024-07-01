import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { useEntityType } from 'context/EntityContext';
import { useCallback, useMemo } from 'react';
import { Schema } from 'types';

function useShards() {
    const taskSpecType = useEntityType();

    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateShards = useCallback(
        async (newShard: Schema) => {
            if (!mutateDraftSpecs || !draftId || draftSpecs.length === 0) {
                console.log('shards update skipped');
                // This means we are calling before a draft was made and that is okay. We'll use the values
                //      from the store while generating the spec
                return Promise.resolve();
            } else {
                const spec: Schema = draftSpecs[0].spec;

                spec.shards ??= {};
                spec.shards = {
                    ...spec.shards,
                    ...newShard,
                };

                const updateResponse = await modifyDraftSpec(spec, {
                    draft_id: draftId,
                    catalog_name: draftSpecs[0].catalog_name,
                    spec_type: taskSpecType,
                });

                if (updateResponse.error) {
                    return Promise.reject('update failed');
                }

                return mutateDraftSpecs();
            }
        },
        [draftId, draftSpecs, mutateDraftSpecs, taskSpecType]
    );

    const shardDisabled = useMemo(
        () =>
            draftSpecs[0]
                ? Boolean(draftSpecs[0].spec?.shards?.disable)
                : false,
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
