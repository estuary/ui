import type { DraftSpecUpdateMatchData } from 'src/api/types';
import type { Schema } from 'src/types';

import { useCallback } from 'react';

import { cloneDeep } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_draftSpecs,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { logRocketEvent } from 'src/services/shared';

// TODO (draft updater) - need to get more settings using this. AutoDiscovery is a good one to switch over
function useDraftUpdater() {
    const draftId = useEditorStore_persistedDraftId();
    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    return useCallback(
        async (
            updateSpec: (oldSpec: Schema) => Schema | undefined,
            updateMatchData: Partial<DraftSpecUpdateMatchData>
        ) => {
            const draftSpec =
                draftSpecs.length > 0 && draftSpecs[0].spec
                    ? draftSpecs[0]
                    : null;

            if (!mutateDraftSpecs || !draftId || !draftSpec) {
                logRocketEvent('PropertyUpdater', {
                    draftIdMissing: !draftId,
                    draftSpecMissing: !draftSpec,
                    mutateMissing: !mutateDraftSpecs,
                });

                // If we do not have these yet do not fail - just keep going and hopefully the calling code
                //  will save the value into a store
                return Promise.resolve();
            }

            const updatedSpec = updateSpec(cloneDeep(draftSpec.spec));

            if (updatedSpec === undefined) {
                // Means we are trying to update something on the spec that isn't there yet so just store off
                //  into the store and keep carrying on
                logRocketEvent('PropertyUpdater', {
                    updatedSpecMissing: true,
                });

                // If we do not have these yet do not fail - just keep going and hopefully the calling code
                //  will save the value into a store
                return Promise.resolve();
            }

            // TODO (zustand) cloning draftSpec for _some_ reason
            // This is here because `useSpecificationIncompatibleSchemaSetting`
            //  was being a pain and not  updating.
            const updateResponse = await modifyDraftSpec(updatedSpec, {
                draft_id: draftId,
                catalog_name: draftSpec.catalog_name,
                ...updateMatchData,
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        },
        [draftId, draftSpecs, mutateDraftSpecs]
    );
}

export default useDraftUpdater;
