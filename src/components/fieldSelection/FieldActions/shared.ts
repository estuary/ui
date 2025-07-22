import type { FieldSelectionType } from 'src/components/fieldSelection/types';
import type {
    ExpandedFieldSelection,
    FieldSelectionDictionary,
} from 'src/stores/Binding/slices/FieldSelection';

import { canRecommendFields } from 'src/utils/fieldSelection-utils';
import {
    isRecommendedField,
    isRequireOnlyField,
} from 'src/utils/workflow-utils';

export const evaluateUpdatedFields = (
    selections: ExpandedFieldSelection[],
    recommendedFlag: boolean | number,
    selectedValue: FieldSelectionType | null
) => {
    const updatedFields: FieldSelectionDictionary = {};

    selections.forEach(({ field, outcome, meta }) => {
        const required = isRequireOnlyField(outcome);
        const recommended = isRecommendedField(outcome);

        let selectionType = required ? 'require' : selectedValue;

        if (canRecommendFields(recommendedFlag)) {
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
