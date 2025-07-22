import type { FieldSelectionType } from 'src/components/fieldSelection/types';
import type { FieldSelection } from 'src/stores/Binding/slices/FieldSelection';
import type { FieldOutcome } from 'src/types/wasm';

import { useCallback } from 'react';

import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { useBinding_setSingleSelection } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    canRecommendFields,
    isFieldSelectionType,
    isSelectedField,
} from 'src/utils/fieldSelection-utils';

const evaluateSelectionType = (
    recommended: boolean,
    toggleValue: FieldSelectionType,
    selectedValue: FieldSelectionType | null,
    targetValue: FieldSelectionType | null
) => {
    logRocketEvent(CustomEvents.FIELD_SELECTION, {
        recommended,
        selectedValue,
        targetValue,
        toggleValue,
    });

    return selectedValue === toggleValue && recommended
        ? 'default'
        : targetValue;
};

export default function useOnFieldActionClick(
    bindingUUID: string,
    field: string
) {
    // Bindings Editor Store
    const recommendedFlag = useBindingStore(
        (state) => state.recommendFields?.[bindingUUID]
    );
    const setSingleSelection = useBinding_setSingleSelection();

    return useCallback(
        (
            value: any,
            selection: FieldSelection | null,
            outcome: FieldOutcome
        ) => {
            if (!isFieldSelectionType(value)) {
                logRocketEvent(CustomEvents.FIELD_SELECTION, {
                    value,
                });

                return;
            }

            const singleValue = selection?.mode !== value ? value : null;

            const selectionType = evaluateSelectionType(
                canRecommendFields(recommendedFlag) && isSelectedField(outcome),
                value,
                selection?.mode ?? null,
                singleValue
            );

            setSingleSelection(
                bindingUUID,
                field,
                selectionType,
                outcome,
                selection?.meta
            );
        },
        [bindingUUID, field, recommendedFlag, setSingleSelection]
    );
}
