import { modifyDraftSpec } from 'api/draftSpecs';
import { BooleanString } from 'components/editor/Bindings/Backfill';
import { useEntityType } from 'context/EntityContext';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { BASE_ERROR } from 'services/supabase';
import { useBinding_backfilledCollections } from 'stores/Binding/hooks';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';
import { getBackfillCounter, getCollectionName } from 'utils/workflow-utils';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from '../../Store/hooks';

export interface BindingMetadata {
    bindingIndex: number;
    collection: string;
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
    const backfilledCollections = useBinding_backfilledCollections();

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

            const spec: Schema = draftSpec.spec;

            if (bindingMetadataExists) {
                bindingMetadata.forEach(({ bindingIndex }) => {
                    if (bindingIndex > -1) {
                        spec.bindings[bindingIndex].backfill =
                            evaluateBackfillCounter(
                                spec.bindings[bindingIndex],
                                increment
                            );
                    }
                });
            } else {
                spec.bindings.forEach((binding: Schema, index: number) => {
                    const collection = getCollectionName(binding);
                    const collectionBackfilled =
                        backfilledCollections.includes(collection);

                    const shouldIncrement =
                        !collectionBackfilled && increment === 'true';

                    const shouldDecrement =
                        collectionBackfilled && increment === 'false';

                    if (shouldIncrement || shouldDecrement) {
                        spec.bindings[index].backfill = evaluateBackfillCounter(
                            binding,
                            increment
                        );
                    }
                });
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
        [backfilledCollections, draftId, entityType, intl, mutateDraftSpecs]
    );

    return { updateBackfillCounter };
}

export default useUpdateBackfillCounter;
