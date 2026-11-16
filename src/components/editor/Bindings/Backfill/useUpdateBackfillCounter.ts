import type { BooleanString } from 'src/components/shared/buttons/types';
import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { BindingMetadata, Schema } from 'src/types';

import { useCallback } from 'react';

import { cloneDeep } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { BASE_ERROR } from 'src/services/supabase';
import {
    useBinding_backfilledBindings,
    useBinding_resourceConfigs,
} from 'src/stores/Binding/hooks';
import { hasLength } from 'src/utils/misc-utils';
import {
    getBackfillCounter,
    getDraftedBindingIndex,
} from 'src/utils/workflow-utils';

interface BackfillChangeSummary {
    counterDecremented: string[];
    counterIncremented: string[];
}

const evaluateBackfillCounter = (
    binding: Schema,
    increment: BooleanString
): number => {
    let counter = getBackfillCounter(binding);

    if (increment === 'true') {
        counter = counter + 1;
    } else if (counter > 0) {
        counter = counter - 1;
    }

    return counter;
};

function useUpdateBackfillCounter() {
    const entityType = useEntityType();

    // Binding Store
    const resourceConfigs = useBinding_resourceConfigs();
    const backfilledBindings = useBinding_backfilledBindings();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const updateBackfillCounter = useCallback(
        async (
            draftSpec: DraftSpecQuery,
            increment: BooleanString,
            bindingMetadata: BindingMetadata[]
        ) => {
            const bindingMetadataExists = hasLength(bindingMetadata);
            const targets = bindingMetadataExists
                ? bindingMetadata.map(({ bindingIndex, collection }) => {
                      const matches = Object.values(resourceConfigs).filter(
                          ({ meta }) =>
                              meta.bindingIndex === bindingIndex &&
                              meta.collectionName === collection
                      );

                      return {
                          collection,
                          bindingIndex:
                              matches.length === 1
                                  ? getDraftedBindingIndex(
                                        matches[0],
                                        draftSpec.spec
                                    )
                                  : -1,
                      };
                  })
                : Object.entries(resourceConfigs)
                      .filter(([uuid]) =>
                          increment === 'true'
                              ? !backfilledBindings.includes(uuid)
                              : backfilledBindings.includes(uuid)
                      )
                      .map(([_uuid, resourceConfig]) => ({
                          collection: resourceConfig.meta.collectionName,
                          bindingIndex: getDraftedBindingIndex(
                              resourceConfig,
                              draftSpec.spec
                          ),
                      }));
            const invalidBinding = targets.find(
                ({ bindingIndex }) => bindingIndex === -1
            );

            if (!mutateDraftSpecs || invalidBinding) {
                const collection =
                    invalidBinding?.collection ??
                    bindingMetadata[0]?.collection;

                return Promise.reject({
                    ...BASE_ERROR,
                    message: bindingMetadataExists
                        ? `There was an issue updating the backfill counter for one or more bindings associated with collection, ${collection}.`
                        : 'There was an issue updating the backfill counter for one or more bindings.',
                });
            }

            const response: BackfillChangeSummary = {
                counterDecremented: [],
                counterIncremented: [],
            };
            const targetChangeSummaryProp: keyof BackfillChangeSummary =
                increment === 'true'
                    ? 'counterIncremented'
                    : 'counterDecremented';

            const spec: Schema = cloneDeep(draftSpec.spec);

            targets.forEach(({ bindingIndex, collection }) => {
                response[targetChangeSummaryProp].push(collection);
                spec.bindings[bindingIndex].backfill = evaluateBackfillCounter(
                    spec.bindings[bindingIndex],
                    increment
                );
            });

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpec.catalog_name,
                spec_type: entityType,
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            const mutateResponse = await mutateDraftSpecs();

            if (!mutateResponse) {
                return Promise.reject();
            }

            return response;
        },
        [
            backfilledBindings,
            draftId,
            entityType,
            mutateDraftSpecs,
            resourceConfigs,
        ]
    );

    return { updateBackfillCounter };
}

export default useUpdateBackfillCounter;
