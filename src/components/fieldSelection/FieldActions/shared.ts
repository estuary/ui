import type { FieldSelectionType } from 'src/components/fieldSelection/types';
import type {
    ExpandedFieldSelection,
    FieldSelectionDictionary,
} from 'src/stores/Binding/slices/FieldSelection';

import {
    isRecommendedField,
    isRequireOnlyField,
} from 'src/utils/workflow-utils';

export const evaluateUpdatedFields = (
    projections: ExpandedFieldSelection[],
    recommendedFlag: boolean | number,
    selectedValue: FieldSelectionType | null
) => {
    const updatedFields: FieldSelectionDictionary = {};

    projections.forEach(({ field, outcome, meta }) => {
        const required = isRequireOnlyField(outcome);

        const recommended = isRecommendedField(outcome);

        let selectionType = required ? 'require' : selectedValue;

        if (recommendedFlag !== false && recommendedFlag !== 0) {
            selectionType =
                (selectedValue === 'exclude' && required) ||
                (selectedValue === null && recommended)
                    ? 'default'
                    : selectedValue;
        }

        updatedFields[field] = { meta, mode: selectionType, outcome };
    });

    return updatedFields;
};
