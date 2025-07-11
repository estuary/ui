import type {
    CompositeProjection,
    FieldSelectionType,
} from 'src/components/editor/Bindings/FieldSelection/types';
import type { FieldSelectionDictionary } from 'src/stores/Binding/slices/FieldSelection';

import {
    isRecommendedField,
    isRequireOnlyField,
} from 'src/utils/workflow-utils';

export const evaluateUpdatedFields = (
    projections: CompositeProjection[],
    recommendedFlag: boolean | number,
    selectedValue: FieldSelectionType | null
) => {
    const updatedFields: FieldSelectionDictionary = {};

    projections.forEach(({ field, constraint, selectionMetadata }) => {
        const required = constraint
            ? isRequireOnlyField(constraint.type)
            : false;

        const recommended = constraint
            ? isRecommendedField(constraint.type)
            : false;

        let selectionType = required ? 'require' : selectedValue;

        if (Boolean(recommendedFlag)) {
            selectionType =
                (selectedValue === 'exclude' && required) ||
                (selectedValue === null && recommended)
                    ? 'default'
                    : selectedValue;
        }

        updatedFields[field] = { meta: selectionMetadata, mode: selectionType };
    });

    return updatedFields;
};
