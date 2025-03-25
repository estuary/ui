import { ConstraintTypes } from 'components/editor/Bindings/FieldSelection/types';

export const TOGGLE_BUTTON_CLASS = 'toggle-button';

export const getConstraintMessageId = (
    constraintType: ConstraintTypes
): string => {
    switch (constraintType) {
        case ConstraintTypes.FIELD_REQUIRED:
            return 'fieldSelection.table.label.translated.fieldRequired';
        case ConstraintTypes.LOCATION_REQUIRED:
            return 'fieldSelection.table.label.translated.locationRequired';
        case ConstraintTypes.LOCATION_RECOMMENDED:
            return 'fieldSelection.table.label.translated.locationRecommended';
        case ConstraintTypes.FIELD_OPTIONAL:
            return 'fieldSelection.table.label.translated.fieldOptional';
        case ConstraintTypes.FIELD_FORBIDDEN:
            return 'fieldSelection.table.label.translated.fieldForbidden';
        case ConstraintTypes.UNSATISFIABLE:
            return 'fieldSelection.table.label.translated.unsatisfiable';
        default:
            return 'fieldSelection.table.label.unknown';
    }
};

export const getConstraintHeaderSettings = (
    constraintType: ConstraintTypes
): [string, 'success' | 'error'] => {
    switch (constraintType) {
        case ConstraintTypes.FIELD_REQUIRED:
            return ['fieldSelection.table.label.fieldRequired', 'success'];
        case ConstraintTypes.LOCATION_REQUIRED:
            return ['fieldSelection.table.label.locationRequired', 'success'];
        case ConstraintTypes.LOCATION_RECOMMENDED:
            return [
                'fieldSelection.table.label.locationRecommended',
                'success',
            ];
        case ConstraintTypes.FIELD_OPTIONAL:
            return ['fieldSelection.table.label.fieldOptional', 'success'];
        case ConstraintTypes.FIELD_FORBIDDEN:
            return ['fieldSelection.table.label.fieldForbidden', 'error'];
        case ConstraintTypes.UNSATISFIABLE:
            return ['fieldSelection.table.label.unsatisfiable', 'error'];
        default:
            return ['fieldSelection.table.label.unknown', 'error'];
    }
};
