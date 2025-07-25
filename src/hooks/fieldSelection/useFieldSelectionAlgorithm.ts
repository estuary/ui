import type {
    BaseMaterializationFields,
    MaterializationBinding,
    MaterializationFields,
    MaterializationFields_Legacy,
} from 'src/types/schemaModels';
import type { FieldSelectionInput, FieldSelectionResult } from 'src/types/wasm';

import { useCallback } from 'react';

import { evaluate_field_selection } from '@estuary/flow-web';

import { useEditorStore_queryResponse_draftSpecs } from 'src/components/editor/Store/hooks';
import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';
import { useBinding_currentBindingIndex } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import { DEFAULT_RECOMMENDED_FLAG } from 'src/utils/fieldSelection-utils';
import { getRelatedBindings } from 'src/utils/workflow-utils';

export interface AlgorithmConfig {
    depth?: number;
    exclude?: BaseMaterializationFields['exclude'];
    reset?: boolean;
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

const getDraftedFieldSelections = (
    draftedBinding: MaterializationBinding,
    config: AlgorithmConfig
) => {
    let fieldStanza:
        | MaterializationFields
        | MaterializationFields_Legacy
        | undefined = draftedBinding?.fields;

    if (typeof config?.depth === 'number') {
        fieldStanza = config?.reset
            ? { recommended: config.depth }
            : { ...fieldStanza, recommended: config.depth };
    }

    if (config?.exclude && config.exclude.length > 0) {
        const existingExcludedFields: string[] = fieldStanza?.exclude ?? [];

        fieldStanza =
            fieldStanza?.recommended === undefined
                ? {
                      recommended: DEFAULT_RECOMMENDED_FLAG,
                      exclude: config.exclude,
                  }
                : {
                      ...fieldStanza,
                      exclude: existingExcludedFields.concat(config.exclude),
                  };
    }

    return fieldStanza;
};

export default function useFieldSelectionAlgorithm() {
    const isEdit = useEntityWorkflow_Editing();

    const currentCollection = useBindingStore(
        (state) => state.currentBinding?.collection
    );
    const stagedBindingIndex = useBinding_currentBindingIndex();

    const draftSpecs = useEditorStore_queryResponse_draftSpecs();

    const validateFieldSelection = useCallback(
        async (config?: AlgorithmConfig) => {
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

            let fieldStanza:
                | MaterializationFields
                | MaterializationFields_Legacy
                | undefined = draftedBinding?.fields;

            if (config) {
                fieldStanza = getDraftedFieldSelections(draftedBinding, config);

                if (!fieldStanza) {
                    return Promise.reject('updated field selections undefined');
                }

                draftedBinding.fields = fieldStanza;
            }

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

            return { builtBinding, fieldStanza, response };
        },
        [currentCollection, draftSpecs, isEdit, stagedBindingIndex]
    );

    return { validateFieldSelection };
}
