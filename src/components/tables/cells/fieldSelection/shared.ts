import { ConstraintTypes } from 'components/editor/Bindings/FieldSelection/types';

export const TOGGLE_BUTTON_CLASS = 'toggle-button';

export const recoverableConstraintTypes = [
    ConstraintTypes.FIELD_REQUIRED,
    ConstraintTypes.LOCATION_REQUIRED,
    ConstraintTypes.LOCATION_RECOMMENDED,
    ConstraintTypes.FIELD_OPTIONAL,
];

export const constraintMessages = {
    [ConstraintTypes.FIELD_REQUIRED]: {
        id: 'fieldSelection.table.label.fieldRequired',
        translatedId: 'fieldSelection.table.label.translated.fieldRequired',
    },
    [ConstraintTypes.LOCATION_REQUIRED]: {
        id: 'fieldSelection.table.label.locationRequired',
        translatedId: 'fieldSelection.table.label.translated.locationRequired',
    },
    [ConstraintTypes.LOCATION_RECOMMENDED]: {
        id: 'fieldSelection.table.label.locationRecommended',
        translatedId:
            'fieldSelection.table.label.translated.locationRecommended',
    },
    [ConstraintTypes.FIELD_OPTIONAL]: {
        id: 'fieldSelection.table.label.fieldOptional',
        translatedId: 'fieldSelection.table.label.translated.fieldOptional',
    },
    [ConstraintTypes.FIELD_FORBIDDEN]: {
        id: 'fieldSelection.table.label.fieldForbidden',
        translatedId: 'fieldSelection.table.label.translated.fieldForbidden',
    },
    [ConstraintTypes.UNSATISFIABLE]: {
        id: 'fieldSelection.table.label.unsatisfiable',
        translatedId: 'fieldSelection.table.label.translated.unsatisfiable',
    },
};
