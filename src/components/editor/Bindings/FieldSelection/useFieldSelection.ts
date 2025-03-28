import { useCallback } from 'react';

import { omit } from 'lodash';

import { modifyDraftSpec } from 'src/api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'src/components/editor/Store/hooks';
import { DraftSpecQuery } from 'src/hooks/useDraftSpecs';
import {
    useBinding_currentBindingIndex,
    useBinding_recommendFields,
    useBinding_selections,
} from 'src/stores/Binding/hooks';
import { ExpandedFieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import { Schema } from 'src/types';
import { hasLength } from 'src/utils/misc-utils';
import { getBindingIndex } from 'src/utils/workflow-utils';

function useFieldSelection(bindingUUID: string, collectionName: string) {
    // Bindings Editor Store
    const recommendFields = useBinding_recommendFields();
    const selections = useBinding_selections();
    const stagedBindingIndex = useBinding_currentBindingIndex();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    return useCallback(
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
            } else {
                const spec: Schema = draftSpec.spec;

                const recommended = Object.hasOwn(recommendFields, bindingUUID)
                    ? recommendFields[bindingUUID]
                    : true;

                spec.bindings[bindingIndex].fields = {
                    recommended,
                    exclude: [],
                    require: {},
                };

                const requiredFields: Pick<
                    ExpandedFieldSelection,
                    'field' | 'meta'
                >[] = Object.entries(selections[bindingUUID])
                    .filter(
                        ([_field, selection]) => selection.mode === 'require'
                    )
                    .map(([field, selection]) => ({
                        field,
                        meta: selection.meta,
                    }));

                const excludedFields: string[] = Object.entries(
                    selections[bindingUUID]
                )
                    .filter(
                        ([_field, selection]) => selection.mode === 'exclude'
                    )
                    .map(([field]) => field);

                if (
                    hasLength(requiredFields) ||
                    hasLength(excludedFields) ||
                    !recommended
                ) {
                    // Remove the require property if no fields are explicitly required, otherwise set the property.
                    if (hasLength(requiredFields)) {
                        const formattedFields: Schema = {};

                        requiredFields.forEach(({ field, meta }) => {
                            formattedFields[field] = meta ?? {};
                        });

                        spec.bindings[bindingIndex].fields.require =
                            formattedFields;
                    } else {
                        spec.bindings[bindingIndex].fields = omit(
                            spec.bindings[bindingIndex].fields,
                            'require'
                        );
                    }

                    // Remove the exclude property if no fields are marked for explicit exclusion, otherwise set the property.
                    if (hasLength(excludedFields)) {
                        spec.bindings[bindingIndex].fields.exclude =
                            excludedFields;
                    } else {
                        spec.bindings[bindingIndex].fields = omit(
                            spec.bindings[bindingIndex].fields,
                            'exclude'
                        );
                    }
                } else {
                    // Remove the fields property from the specification if it equates to default behavior.
                    spec.bindings[bindingIndex] = omit(
                        spec.bindings[bindingIndex],
                        'fields'
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
            }
        },
        [
            bindingUUID,
            collectionName,
            draftId,
            mutateDraftSpecs,
            recommendFields,
            selections,
            stagedBindingIndex,
        ]
    );
}

export default useFieldSelection;
