import type { UpdateMatchData } from 'src/api/draftSpecs';
import type { Schema } from 'src/types';

import { useCallback, useMemo } from 'react';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { logRocketEvent } from 'src/services/shared';

function useSpecPropertyUpdater() {
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const draftSpec = useMemo(
        () =>
            draftSpecs.length > 0 && draftSpecs[0].spec ? draftSpecs[0] : null,
        [draftSpecs]
    );

    return useCallback(
        async (
            updateSpec: (oldSpec: any) => Schema,
            updateMatchData: Partial<UpdateMatchData>
        ) => {
            if (!mutateDraftSpecs || !draftId || !draftSpec) {
                logRocketEvent('PropertyUpdater', {
                    draftIdMissing: !draftId,
                    draftSpecMissing: !draftSpec,
                    mutateMissing: !mutateDraftSpecs,
                });

                return Promise.resolve();
            }

            const updateResponse = await modifyDraftSpec(
                updateSpec(draftSpec.spec),
                {
                    draft_id: draftId,
                    catalog_name: draftSpec.catalog_name,
                    ...updateMatchData,
                }
            );

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        },
        [draftId, draftSpec, mutateDraftSpecs]
    );
}

export default useSpecPropertyUpdater;
