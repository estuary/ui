import { modifyDraftSpec } from 'api/draftSpecs';
import { BooleanString } from 'components/editor/Bindings/Backfill';
import { useEntityType } from 'context/EntityContext';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { BASE_ERROR } from 'services/supabase';
import { useResourceConfig_backfilledCollections } from 'stores/ResourceConfig/hooks';
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
): Schema => {
    let counter = getBackfillCounter(binding);

    if (increment === 'true') {
        counter = counter + 1;
    } else if (counter > 0) {
        counter = counter - 1;
    }

    binding.backfill = counter;

    return binding;
};

function useUpdateBackfillCounter() {
    const intl = useIntl();
    const entityType = useEntityType();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    // Resource Config Store
    const backfilledCollections = useResourceConfig_backfilledCollections();

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
                    ? 'workflows.collectionSelector.manualBackfill.error.message'
                    : '';

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
                    console.log('A', bindingIndex);

                    if (bindingIndex > -1) {
                        spec.bindings[bindingIndex] = evaluateBackfillCounter(
                            spec.bindings[bindingIndex],
                            increment
                        );
                    }
                });
            } else {
                console.log('B');

                spec.bindings.forEach((binding: Schema, index: number) => {
                    const collection = getCollectionName(binding);

                    const shouldIncrement =
                        !backfilledCollections.includes(collection) &&
                        increment === 'true';

                    const shouldDecrement =
                        backfilledCollections.includes(collection) &&
                        increment === 'false';

                    if (shouldIncrement || shouldDecrement) {
                        spec.bindings[index] = evaluateBackfillCounter(
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
