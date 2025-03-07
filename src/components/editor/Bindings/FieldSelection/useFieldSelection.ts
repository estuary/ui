import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { omit } from 'lodash';
import { useCallback } from 'react';
import {
    useBinding_currentBindingIndex,
    useBinding_recommendFields,
    useBinding_selections,
} from 'stores/Binding/hooks';
import { ExpandedFieldSelection } from 'stores/Binding/slices/FieldSelection';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';
import { getBindingIndex } from 'utils/workflow-utils';

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
                    include: {},
                };

                const includedFields: Pick<
                    ExpandedFieldSelection,
                    'field' | 'meta'
                >[] = Object.entries(selections[bindingUUID])
                    .filter(
                        ([_field, selection]) => selection.mode === 'include'
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
                    hasLength(includedFields) ||
                    hasLength(excludedFields) ||
                    !recommended
                ) {
                    // Remove the include property if no fields are marked for explicit inclusion, otherwise set the property.
                    if (hasLength(includedFields)) {
                        const formattedFields: Schema = {};

                        includedFields.forEach(({ field, meta }) => {
                            formattedFields[field] = meta ?? {};
                        });

                        spec.bindings[bindingIndex].fields.include =
                            formattedFields;
                    } else {
                        spec.bindings[bindingIndex].fields = omit(
                            spec.bindings[bindingIndex].fields,
                            'include'
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
