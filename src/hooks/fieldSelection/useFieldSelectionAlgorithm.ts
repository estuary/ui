import type { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';
import type { FieldSelectionInput, FieldSelectionResult } from 'src/types/wasm';

import { useCallback } from 'react';

import { evaluate_field_selection } from '@estuary/flow-web';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { useBinding_currentBindingIndex } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { useFormStateStore_liveSpec } from 'src/stores/FormState/hooks';
import { getRelatedBindings } from 'src/utils/workflow-utils';

// evaluate_field selection WASM routine documentation can be found here:
// https://github.com/estuary/flow/blob/master/crates/flow-web/FIELD_SELECTION.md

// Call into the flow WASM handler
const evaluateFieldSelection = async (input: FieldSelectionInput) => {
    let response: FieldSelectionResult | undefined;

    try {
        response = evaluate_field_selection(input);
        // We can catch any error here so that any issue causes an empty response and the
        //  component will show an error... though not the most useful one.
        // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
    } catch (e: any) {
        logRocketEvent('evaluate_field_selection:failed', e);
    }

    return response;
};

export default function useFieldSelectionAlgorithm() {
    const isEdit = useEntityWorkflow_Editing();

    const currentCollection = useBindingStore(
        (state) => state.currentBinding?.collection
    );
    const stagedBindingIndex = useBinding_currentBindingIndex();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const liveSpec = useFormStateStore_liveSpec();

    const applyFieldSelectionAlgorithm = useCallback(
        async (
            selectionAlgorithm: SelectionAlgorithm,
            metadata?: { depth?: number }
        ) => {
            if (
                draftSpecs.length === 0 ||
                !draftSpecs[0].built_spec ||
                !draftSpecs[0].validated ||
                !currentCollection
            ) {
                return Promise.reject(
                    'missing draft spec data for algo application'
                );
            }

            const {
                builtBinding,
                draftedBinding,
                liveBinding,
                validationBinding,
            } = getRelatedBindings(
                draftSpecs[0].built_spec,
                draftSpecs[0].spec,
                stagedBindingIndex,
                currentCollection,
                draftSpecs[0].validated,
                isEdit ? liveSpec : undefined
            );

            if (!builtBinding || !draftedBinding || !validationBinding) {
                return Promise.reject(
                    'data not found: built spec binding, drafted binding, or validation binding'
                );
            }

            // TODO: Create function that takes a selection algorithm as input
            //   and returns the modified binding.
            if (selectionAlgorithm === 'depthOne' && metadata?.depth) {
                draftedBinding.fields.recommended = metadata.depth;
            }

            let result: FieldSelectionResult | undefined;

            try {
                result = await evaluateFieldSelection({
                    collectionKey: builtBinding.collection.key,
                    collectionProjections: builtBinding.collection.projections,
                    liveSpec: liveBinding,
                    model: draftedBinding,
                    validated: validationBinding,
                });
            } catch (error: unknown) {
                logRocketEvent('evaluate_field_selection:failed', error);
            }

            return result;
        },
        [currentCollection, draftSpecs, isEdit, liveSpec, stagedBindingIndex]
    );

    return { applyFieldSelectionAlgorithm };
}
