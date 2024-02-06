import { modifyDraftSpec } from 'api/draftSpecs';
import { useEntityType } from 'context/EntityContext';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { BASE_ERROR } from 'services/supabase';
import { useResourceConfig_backfilledCollections } from 'stores/ResourceConfig/hooks';
import { Schema } from 'types';
import { getBackfillCounter, getCollectionName } from 'utils/workflow-utils';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from '../../Store/hooks';
import { BooleanString } from '.';

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

    // TODO: Make the binding metadata argument an array.
    const updateBackfillCounter = useCallback(
        async (
            draftSpec: DraftSpecQuery,
            increment: BooleanString,
            bindingMetadata?: BindingMetadata
        ) => {
            if (
                !mutateDraftSpecs ||
                (bindingMetadata && bindingMetadata.bindingIndex === -1)
            ) {
                const errorMessageId = bindingMetadata
                    ? 'workflows.collectionSelector.manualBackfill.error.message'
                    : '';

                const errorMessageValues = bindingMetadata
                    ? { collection: bindingMetadata.collection }
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

            if (bindingMetadata && bindingMetadata.bindingIndex > -1) {
                const { bindingIndex } = bindingMetadata;

                spec.bindings[bindingIndex] = evaluateBackfillCounter(
                    spec.bindings[bindingIndex],
                    increment
                );
            } else {
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
