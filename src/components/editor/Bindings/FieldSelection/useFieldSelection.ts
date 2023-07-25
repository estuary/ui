import { modifyDraftSpec } from 'api/draftSpecs';
import {
    useBindingsEditorStore_recommendFields,
    useBindingsEditorStore_selectionActive,
    useBindingsEditorStore_selections,
    useBindingsEditorStore_setSelectionActive,
    useBindingsEditorStore_setSelectionSaving,
} from 'components/editor/Bindings/Store/hooks';
import {
    useEditorStore_persistedDraftId,
    useEditorStore_queryResponse_mutate,
} from 'components/editor/Store/hooks';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { debounce, omit } from 'lodash';
import { useCallback, useEffect } from 'react';
import { Schema } from 'types';
import { hasLength } from 'utils/misc-utils';

function useFieldSelection(collectionName: string) {
    // Bindings Editor Store
    const recommendFields = useBindingsEditorStore_recommendFields();

    const selections = useBindingsEditorStore_selections();
    const selectionActive = useBindingsEditorStore_selectionActive();
    const setSelectionActive = useBindingsEditorStore_setSelectionActive();
    const setSelectionSaving = useBindingsEditorStore_setSelectionSaving();

    // Draft Editor Store
    const draftId = useEditorStore_persistedDraftId();
    const mutateDraftSpecs = useEditorStore_queryResponse_mutate();

    // TODO (field Selection): Determine a comfortable debounce interval. A second or less feels too quick
    //   but five seconds feels too long.
    const debouncedUpdate = useCallback(
        debounce(() => {
            setSelectionActive(false);
            setSelectionSaving(true);
        }, 3000),
        [setSelectionActive, setSelectionSaving]
    );

    useEffect(() => {
        if (selectionActive) {
            debouncedUpdate();
        }
    }, [debouncedUpdate, selectionActive]);

    return useCallback(
        async (draftSpec: DraftSpecQuery) => {
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

            const bindingIndex: number = draftSpec.spec.bindings.findIndex(
                (binding: any) => binding.source === collectionName
            );

            if (!mutateDraftSpecs || bindingIndex === -1) {
                return Promise.reject();
            } else {
                const spec: Schema = draftSpec.spec;

                spec.bindings[bindingIndex].fields = {
                    recommended: recommendFields,
                    exclude: [],
                    include: {},
                };

                if (
                    hasLength(includedFields) ||
                    hasLength(excludedFields) ||
                    !recommendFields
                ) {
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
                    return Promise.reject();
                }

                return mutateDraftSpecs();
            }
        },
        [mutateDraftSpecs, collectionName, draftId, recommendFields, selections]
    );
}

export default useFieldSelection;
