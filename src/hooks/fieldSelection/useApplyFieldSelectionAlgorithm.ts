import type { FieldSelectionInput, FieldSelectionResult } from 'src/types/wasm';

import { useCallback } from 'react';

import { evaluate_field_selection } from '@estuary/flow-web';

import { logRocketEvent } from 'src/services/shared';

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

export default function useApplyFieldSelectionAlgorithm() {
    const applyFieldSelectionAlgorithm = useCallback(
        async (input: FieldSelectionInput) => {
            const test = await evaluateFieldSelection(input);

            return test;
        },
        []
    );

    return { applyFieldSelectionAlgorithm };
}
