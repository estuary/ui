import type {
    BuiltSpec_Binding,
    ValidationResponse_Binding,
} from 'src/components/editor/Bindings/FieldSelection/types';
import type { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';
import type {
    FieldSelectionInput,
    FieldSelectionResult,
    MaterializationBinding,
} from 'src/types/wasm';

import { useCallback } from 'react';

import { evaluate_field_selection } from '@estuary/flow-web';
import { isEqual } from 'lodash';

import {
    useEditorStore_currentCatalog,
    useEditorStore_queryResponse_draftSpecs,
} from 'src/components/editor/Store/hooks';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { useBinding_currentBindingIndex } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { getBindingIndex } from 'src/utils/workflow-utils';

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

    const currentBinding = useBindingStore((state) => state.currentBinding);
    const stagedBindingIndex = useBinding_currentBindingIndex();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();
    const liveSpec = useEditorStore_currentCatalog();

    const applyFieldSelectionAlgorithm = useCallback(
        async (
            selectionAlgorithm: SelectionAlgorithm,
            metadata?: { depth?: number }
        ) => {
            if (
                draftSpecs.length === 0 ||
                !draftSpecs[0].built_spec ||
                !draftSpecs[0].validated ||
                !currentBinding
            ) {
                return Promise.reject(
                    'missing draft spec data for algo application'
                );
            }

            // Select the binding from the built spec that corresponds to the current collection
            //  to extract the projection information.
            // Defaulting to empty array. This is to handle when a user has disabled a collection
            //  which causes the binding to not be included in the built_spec
            const builtSpecBindings: BuiltSpec_Binding[] =
                draftSpecs[0].built_spec.bindings ?? [];

            const selectedBuiltSpecBinding: BuiltSpec_Binding | undefined =
                builtSpecBindings.find(
                    (binding) =>
                        binding.collection.name === currentBinding.collection
                );

            if (!selectedBuiltSpecBinding) {
                return Promise.reject('data not found: built spec binding');
            }

            const evaluatedProjections =
                selectedBuiltSpecBinding.collection.projections;

            // The validation phase of a publication produces a document which correlates each binding projection
            // to a constraint type (defined in flow/go/protocols/materialize/materialize.proto). Select the binding
            // from the validation document that corresponds to the current collection to extract the constraint types.
            const validationBindings: ValidationResponse_Binding[] =
                draftSpecs[0].validated.bindings;

            const selectedValidationBinding:
                | ValidationResponse_Binding
                | undefined = validationBindings.find((binding) =>
                isEqual(
                    binding.resourcePath,
                    selectedBuiltSpecBinding.resourcePath
                )
            );

            if (!selectedValidationBinding) {
                return Promise.reject('data not found: validated binding');
            }

            let liveBinding: MaterializationBinding | undefined;

            if (isEdit) {
                const liveBindings: MaterializationBinding[] =
                    liveSpec?.spec.bindings;

                liveBinding = liveBindings.find((binding) =>
                    isEqual(
                        binding.resourcePath,
                        selectedBuiltSpecBinding.resourcePath
                    )
                );
            }

            const bindingIndex: number = getBindingIndex(
                draftSpecs[0].spec.bindings,
                currentBinding.collection,
                stagedBindingIndex
            );
            let selectedBinding: MaterializationBinding | undefined =
                bindingIndex > -1
                    ? draftSpecs[0].spec.bindings[bindingIndex]
                    : undefined;

            if (!selectedBinding) {
                return Promise.reject('data not found: drafted binding');
            }

            // TODO: Create function that takes a selection algorithm as input
            //   and returns the modified binding.
            if (selectionAlgorithm === 'depthOne' && metadata?.depth) {
                selectedBinding.fields.recommended = metadata.depth;
            }

            let result: FieldSelectionResult | undefined;

            try {
                result = await evaluateFieldSelection({
                    collectionKey: selectedBuiltSpecBinding.collection.key,
                    collectionProjections: evaluatedProjections,
                    liveSpec: liveBinding,
                    model: selectedBinding,
                    validated: selectedValidationBinding,
                });
            } catch (error: unknown) {
                logRocketEvent('evaluate_field_selection:failed', error);
            }

            return result;
        },
        [currentBinding, draftSpecs, isEdit, liveSpec, stagedBindingIndex]
    );

    return { applyFieldSelectionAlgorithm };
}
