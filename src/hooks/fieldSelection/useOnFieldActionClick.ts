import { FieldSelectionType } from 'components/editor/Bindings/FieldSelection/types';
import { useCallback } from 'react';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { useBinding_setSingleSelection } from 'stores/Binding/hooks';
import { FieldSelection } from 'stores/Binding/slices/FieldSelection';
import { useBindingStore } from 'stores/Binding/Store';
import { isFieldSelectionType } from 'utils/workflow-utils';

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
    const recommended = useBindingStore(
        (state) => state.recommendFields[bindingUUID]
    );
    const setSingleSelection = useBinding_setSingleSelection();

    return useCallback(
        (value: any, selection: FieldSelection | null) => {
            if (!isFieldSelectionType(value)) {
                logRocketEvent(CustomEvents.FIELD_SELECTION, {
                    value,
                });

                return;
            }

            const singleValue = selection?.mode !== value ? value : null;

            const selectionType = evaluateSelectionType(
                recommended,
                value,
                selection?.mode ?? null,
                singleValue
            );

            setSingleSelection(
                bindingUUID,
                field,
                selectionType,
                selection?.meta
            );
        },
        [bindingUUID, field, recommended, setSingleSelection]
    );
}
