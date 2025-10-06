import type { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import type { Schema } from 'src/types';

import { useCallback } from 'react';

import { cloneDeep, omit } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { useBinding_currentBindingIndex } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { DEFAULT_RECOMMENDED_FLAG } from 'src/utils/fieldSelection-utils';
import { hasLength } from 'src/utils/misc-utils';
import { getBindingIndex } from 'src/utils/workflow-utils';

function useFieldSelection(bindingUUID: string, collectionName: string) {
    const recommendFields = useBindingStore((state) => state.recommendFields);
    const selections = useBindingStore((state) => state.selections);
    const stagedBindingIndex = useBinding_currentBindingIndex();

    const draftId = useEditorStore_persistedDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    const fieldsRecommended = useSourceCaptureStore(
        (state) => state.fieldsRecommended
    );

    const applyFieldSelection = useCallback(
        async (draftSpec: DraftSpecQuery) => {
            // TODO (field selection) we should make it so this does not need to be figured out
            //  every call as it is pretty wasteful. Since we are passing in the spec already maybe
            //  we just pass in the index along with it? Not sure how to do this and make it feel good.
            const bindingIndex: number = getBindingIndex(
                draftSpec.spec.bindings,
                collectionName,
                stagedBindingIndex
            );

            if (!mutateDraftSpecs || bindingIndex === -1) {
                return Promise.reject();
            }

            const spec: Schema = cloneDeep(draftSpec.spec);

            const recommended = Object.hasOwn(recommendFields, bindingUUID)
                ? recommendFields[bindingUUID]
                : (fieldsRecommended ?? DEFAULT_RECOMMENDED_FLAG);

            spec.bindings[bindingIndex].fields = {
                recommended,
                exclude: [],
                require: {},
            };

            const requiredFields: Pick<FieldSelection, 'field' | 'meta'>[] =
                Object.entries(selections[bindingUUID].value)
                    .filter(
                        ([_field, selection]) => selection.mode === 'require'
                    )
                    .map(([field, selection]) => ({
                        field,
                        meta: selection.meta,
                    }));

            const excludedFields: string[] = Object.entries(
                selections[bindingUUID].value
            )
                .filter(([_field, selection]) => selection.mode === 'exclude')
                .map(([field]) => field);

            // Remove the require property if no fields are explicitly required, otherwise set the property.
            if (hasLength(requiredFields)) {
                const formattedFields: Schema = {};

                requiredFields.forEach(({ field, meta }) => {
                    formattedFields[field] = meta ?? {};
                });

                spec.bindings[bindingIndex].fields.require = formattedFields;
            } else {
                spec.bindings[bindingIndex].fields = omit(
                    spec.bindings[bindingIndex].fields,
                    'require'
                );
            }

            // Remove the exclude property if no fields are marked for explicit exclusion, otherwise set the property.
            if (hasLength(excludedFields)) {
                spec.bindings[bindingIndex].fields.exclude = excludedFields;
            } else {
                spec.bindings[bindingIndex].fields = omit(
                    spec.bindings[bindingIndex].fields,
                    'exclude'
                );
            }

            const updateResponse = await modifyDraftSpec(spec, {
                draft_id: draftId,
                catalog_name: draftSpec.catalog_name,
                spec_type: 'materialization',
            });

            if (updateResponse.error) {
                return Promise.reject(updateResponse.error);
            }

            return mutateDraftSpecs();
        },
        [
            bindingUUID,
            collectionName,
            draftId,
            fieldsRecommended,
            mutateDraftSpecs,
            recommendFields,
            selections,
            stagedBindingIndex,
        ]
    );

    return { applyFieldSelection };
}

export default useFieldSelection;
