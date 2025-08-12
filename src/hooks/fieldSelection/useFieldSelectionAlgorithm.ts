import type {
    BaseMaterializationFields,
    BuiltBinding,
    MaterializationBinding,
    ValidatedBinding,
} from 'src/types/schemaModels';
import type { FieldSelectionInput, FieldSelectionResult } from 'src/types/wasm';

import { useCallback } from 'react';

import { evaluate_field_selection } from '@estuary/flow-web';

import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { logRocketEvent } from 'src/services/shared';

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

export default function useFieldSelectionAlgorithm() {
    const isEdit = useEntityWorkflow_Editing();

    const validateFieldSelection = useCallback(
        async (
            builtBinding: BuiltBinding | undefined,
            draftedBinding: MaterializationBinding | undefined,
            validatedBinding: ValidatedBinding | undefined
        ) => {
            if (!builtBinding || !draftedBinding || !validatedBinding) {
                return Promise.reject(
                    'data not found: built spec binding, drafted binding, or validation binding'
                );
            }

            let response: FieldSelectionResult | undefined;

            try {
                response = await evaluateFieldSelection({
                    collectionKey: builtBinding.collection.key,
                    collectionProjections: builtBinding.collection.projections,
                    liveSpec: isEdit ? builtBinding : undefined,
                    model: draftedBinding,
                    validated: validatedBinding,
                });
            } catch (error: unknown) {
                logRocketEvent('evaluate_field_selection:failed', error);
            }

            return { fieldStanza: draftedBinding?.fields, response };
        },
        [isEdit]
    );

    return { validateFieldSelection };
}
