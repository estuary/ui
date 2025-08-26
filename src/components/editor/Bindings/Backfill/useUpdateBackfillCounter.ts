import type { BooleanString } from 'src/components/shared/buttons/types';
import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { BindingMetadata, Schema } from 'src/types';

import { useCallback } from 'react';

import { cloneDeep } from 'lodash';
import { useIntl } from 'react-intl';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { useEntityType } from 'src/context/EntityContext';
import { BASE_ERROR } from 'src/services/supabase';
import {
    useBinding_backfilledBindings,
    useBinding_bindings,
} from 'src/stores/Binding/hooks';
import { hasLength } from 'src/utils/misc-utils';
import { getBackfillCounter, getBindingIndex } from 'src/utils/workflow-utils';

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
    const intl = useIntl();
    const entityType = useEntityType();

    // Binding Store
    const bindings = useBinding_bindings();
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

            const invalidBindingIndex = bindingMetadataExists
                ? bindingMetadata.findIndex(
                      ({ bindingIndex }) => bindingIndex === -1
                  )
                : -1;

            if (!mutateDraftSpecs || invalidBindingIndex > -1) {
                const errorMessageId = bindingMetadataExists
                    ? 'workflows.collectionSelector.manualBackfill.error.message.singleCollection'
                    : 'workflows.collectionSelector.manualBackfill.error.message.allBindings';

                const errorMessageValues = bindingMetadataExists
                    ? {
                          collection:
                              bindingMetadata[invalidBindingIndex].collection,
                      }
                    : undefined;

                return Promise.reject({
                    ...BASE_ERROR,
                    message: intl.formatMessage(
                        { id: errorMessageId },
                        errorMessageValues
                    ),
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

            if (bindingMetadataExists) {
                bindingMetadata.forEach(({ bindingIndex, collection }) => {
                    if (bindingIndex > -1) {
                        response[targetChangeSummaryProp].push(collection);

                        spec.bindings[bindingIndex].backfill =
                            evaluateBackfillCounter(
                                spec.bindings[bindingIndex],
                                increment
                            );
                    }
                });
            } else {
                Object.entries(bindings).forEach(
                    ([collection, bindingUUIDs]) => {
                        bindingUUIDs.forEach((bindingUUID, iteratedIndex) => {
                            const existingBindingIndex = getBindingIndex(
                                spec.bindings,
                                collection,
                                iteratedIndex
                            );

                            if (existingBindingIndex > -1) {
                                const backfilled =
                                    backfilledBindings.includes(bindingUUID);

                                const shouldIncrement =
                                    !backfilled && increment === 'true';

                                const shouldDecrement =
                                    backfilled && increment === 'false';

                                if (shouldIncrement || shouldDecrement) {
                                    response[targetChangeSummaryProp].push(
                                        collection
                                    );

                                    spec.bindings[
                                        existingBindingIndex
                                    ].backfill = evaluateBackfillCounter(
                                        spec.bindings[existingBindingIndex],
                                        increment
                                    );
                                }
                            }
                        });
                    }
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

            const mutateResponse = await mutateDraftSpecs();

            if (!mutateResponse) {
                return Promise.reject();
            }

            return response;
        },
        [
            backfilledBindings,
            bindings,
            draftId,
            entityType,
            intl,
            mutateDraftSpecs,
        ]
    );

    return { updateBackfillCounter };
}

export default useUpdateBackfillCounter;
