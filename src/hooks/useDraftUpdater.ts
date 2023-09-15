import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { useCallback } from 'react';
import { Schema } from 'types';

type UpdaterFunction = (spec: Schema) => Schema;

function useDraftUpdater(updater: UpdaterFunction) {
    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    return useCallback(async () => {
        if (!mutateDraftSpecs || !draftId || draftSpecs.length === 0) {
            return Promise.reject();
        } else {
            const spec: Schema = updater(draftSpecs[0].spec);

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpecs[0].catalog_name,
                spec_type: draftSpecs[0].spec_type,
            });

            if (updateResponse.error) {
                return Promise.reject();
            }

            return mutateDraftSpecs();
        }
    }, [draftId, draftSpecs, mutateDraftSpecs, updater]);
}

export default useDraftUpdater;
