import { FieldSelectionDictionary } from 'stores/Binding/slices/FieldSelection';
import { isRequireOnlyField } from 'utils/workflow-utils';
import { CompositeProjection, FieldSelectionType } from '../types';

export const evaluateUpdatedFields = (
    projections: CompositeProjection[],
    recommended: boolean,
    selectedValue: FieldSelectionType
) => {
    const updatedFields: FieldSelectionDictionary = {};

    projections.forEach(({ field, constraint, selectionMetadata }) => {
        const required = constraint
            ? isRequireOnlyField(constraint.type)
            : false;

        let selectionType = required ? 'require' : selectedValue;

        if (recommended) {
            selectionType =
                selectedValue === 'exclude' && required
                    ? 'default'
                    : selectedValue;
        }

        updatedFields[field] = { meta: selectionMetadata, mode: selectionType };
    });

    return updatedFields;
};
