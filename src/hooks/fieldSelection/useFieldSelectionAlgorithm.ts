import type { CompositeProjection } from 'src/components/editor/Bindings/FieldSelection/types';
import type { SelectionAlgorithm } from 'src/stores/Binding/slices/FieldSelection';
import type { Schema } from 'src/types';
import type {
    FieldSelectionInput,
    FieldSelectionResult,
    MaterializationBinding,
} from 'src/types/wasm';

import { useCallback } from 'react';

import { evaluate_field_selection } from '@estuary/flow-web';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { useBinding_currentBindingIndex } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    getRelatedBindings,
    isExcludeOnlyField,
    isRequireOnlyField,
} from 'src/utils/workflow-utils';

export interface AlgorithmConfig {
    depth?: number;
}

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

    const currentBindingUUID = useBindingStore(
        (state) => state.currentBinding?.uuid
    );
    const currentCollection = useBindingStore(
        (state) => state.currentBinding?.collection
    );
    const selections = useBindingStore((state) => state.selections);
    const stagedBindingIndex = useBinding_currentBindingIndex();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const getDraftedFieldSelections = useCallback(
        (
            draftedBinding: MaterializationBinding,
            selectionAlgorithm: SelectionAlgorithm,
            projections: CompositeProjection[],
            config?: AlgorithmConfig
        ) => {
            if (!currentBindingUUID) {
                return undefined;
            }

            let fieldStanza: Schema = draftedBinding?.fields ?? {};
            const fieldSelection = selections[currentBindingUUID];

            if (selectionAlgorithm === 'depthOne' && config?.depth) {
                fieldStanza = { recommended: config.depth };
            } else if (selectionAlgorithm === 'excludeAll') {
                fieldStanza = {
                    recommended: fieldStanza?.recommended,
                    exclude: Object.keys(fieldSelection).filter((field) => {
                        const selectedProjection = projections.find(
                            (projection) => projection.field === field
                        );

                        if (!selectedProjection?.constraint) {
                            return false;
                        }

                        const { constraint } = selectedProjection;

                        if (fieldStanza?.recommended === false) {
                            return isExcludeOnlyField(constraint.type);
                        }

                        return !isRequireOnlyField(constraint.type);
                    }),
                };
            } else if (selectionAlgorithm === 'recommended') {
                fieldStanza = { recommended: true };
            }

            return fieldStanza;
        },
        [currentBindingUUID, selections]
    );

    const applyFieldSelectionAlgorithm = useCallback(
        async (
            selectionAlgorithm: SelectionAlgorithm,
            projections: CompositeProjection[],
            config?: AlgorithmConfig
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

            const { builtBinding, draftedBinding, validationBinding } =
                getRelatedBindings(
                    draftSpecs[0].built_spec,
                    draftSpecs[0].spec,
                    stagedBindingIndex,
                    currentCollection,
                    draftSpecs[0].validated
                );

            if (!builtBinding || !draftedBinding || !validationBinding) {
                return Promise.reject(
                    'data not found: built spec binding, drafted binding, or validation binding'
                );
            }

            const updatedSelections = getDraftedFieldSelections(
                draftedBinding,
                selectionAlgorithm,
                projections,
                config
            );

            if (!updatedSelections) {
                return Promise.reject('updated field selections undefined');
            }

            draftedBinding.fields = updatedSelections;

            let response: FieldSelectionResult | undefined;

            try {
                response = await evaluateFieldSelection({
                    collectionKey: builtBinding.collection.key,
                    collectionProjections: builtBinding.collection.projections,
                    liveSpec: isEdit ? builtBinding : undefined,
                    model: draftedBinding,
                    validated: validationBinding,
                });
            } catch (error: unknown) {
                logRocketEvent('evaluate_field_selection:failed', error);
            }

            return { fieldStanza: updatedSelections, response };
        },
        [
            currentCollection,
            draftSpecs,
            getDraftedFieldSelections,
            isEdit,
            stagedBindingIndex,
        ]
    );

    return { applyFieldSelectionAlgorithm };
}
