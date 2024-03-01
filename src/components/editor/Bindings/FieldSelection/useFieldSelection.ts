import { modifyDraftSpec } from 'api/draftSpecs';
import { useBindingsEditorStore_selections } from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { omit } from 'lodash';
import { useCallback } from 'react';
import { useBinding_recommendFields } from 'stores/Binding/hooks';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';
import { getBindingIndex } from 'utils/workflow-utils';

function useFieldSelection(bindingUUID: string, collectionName: string) {
    // Bindings Editor Store
    const recommendFields = useBinding_recommendFields();
    const selections = useBindingsEditorStore_selections();

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
                collectionName
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

                const includedFields: string[] = Object.entries(selections)
                    .filter(
                        ([_field, selectionType]) => selectionType === 'include'
                    )
                    .map(([field]) => field);

                const excludedFields: string[] = Object.entries(selections)
                    .filter(
                        ([_field, selectionType]) => selectionType === 'exclude'
                    )
                    .map(([field]) => field);

                if (
                    hasLength(includedFields) ||
                    hasLength(excludedFields) ||
                    !recommended
                ) {
                    // Remove the include property if no fields are marked for explicit inclusion, otherwise set the property.
                    if (hasLength(includedFields)) {
                        const formattedFields = {};

                        includedFields.forEach((field) => {
                            formattedFields[field] = {};
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
        ]
    );
}

export default useFieldSelection;
