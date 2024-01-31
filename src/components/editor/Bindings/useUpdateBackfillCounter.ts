import { modifyDraftSpec } from 'api/draftSpecs';
import { useEntityType } from 'context/EntityContext';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { omit } from 'lodash';
import { useCallback } from 'react';
import { Schema } from 'types';
import {
    useEditorStore_id,
    useEditorStore_queryResponse_mutate,
} from '../Store/hooks';
import { BooleanString } from './ManualBackfill';

function useUpdateBackfillCounter() {
    const entityType = useEntityType();

    // Draft Editor Store
    const draftId = useEditorStore_id();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateBackfillCounter = useCallback(
        async (
            draftSpec: DraftSpecQuery,
            bindingIndex: number,
            increment: BooleanString
        ) => {
            if (!mutateDraftSpecs || bindingIndex === -1) {
                return Promise.reject();
            }

            const spec: Schema = draftSpec.spec;
            const binding: Schema = spec.bindings[bindingIndex];
            let counter: number = Object.hasOwn(binding, 'backfill')
                ? binding.backfill
                : 0;

            if (increment === 'true') {
                counter = counter + 1;
            } else if (counter > 0) {
                counter = counter - 1;
            }

            if (counter > 0) {
                spec.bindings[bindingIndex].backfill = counter;
            } else {
                // Remove the backfill property from the specification if it equates to default behavior.
                spec.bindings[bindingIndex] = omit(
                    spec.bindings[bindingIndex],
                    'backfill'
                );
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpec.catalog_name,
                spec_type: entityType,
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        },
        [draftId, entityType, mutateDraftSpecs]
    );

    return { updateBackfillCounter };
}

export default useUpdateBackfillCounter;
