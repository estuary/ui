import type {
    FieldSelectionType,
    Projection,
} from 'src/components/fieldSelection/types';
import type { FieldSelectionDictionary } from 'src/stores/Binding/slices/FieldSelection';
import type {
    BaseMaterializationFields,
    MaterializationFields,
    MaterializationFields_Legacy,
} from 'src/types/schemaModels';
import type { FieldOutcome } from 'src/types/wasm';

export const DEFAULT_RECOMMENDED_FLAG: BaseMaterializationFields['recommended'] = 1;

export const canRecommendFields = (
    recommendedFlag: BaseMaterializationFields['recommended'] | undefined
): boolean => recommendedFlag !== false;

export const isSelectedField = (outcome: FieldOutcome): boolean => {
    return Boolean(!outcome?.reject && outcome?.select);
};

export const isUnselectedField = (outcome: FieldOutcome): boolean =>
    Boolean(!outcome?.select && outcome?.reject);

export const hasFieldConflict = (outcome: FieldOutcome): boolean =>
    Boolean(outcome?.select && outcome?.reject);

export const isFieldSelectionType = (value: any): value is FieldSelectionType =>
    typeof value === 'string' &&
    (value === 'default' || value === 'exclude' || value === 'require');

const isMaterializationFields = (
    value: MaterializationFields | MaterializationFields_Legacy
): value is MaterializationFields => 'require' in value;

export const getFieldSelection = (
    outcomes: FieldOutcome[],
    fieldsStanza?: MaterializationFields | MaterializationFields_Legacy,
    projections?: Projection[]
): FieldSelectionDictionary => {
    const updatedSelections: FieldSelectionDictionary = {};

    outcomes.forEach((outcome) => {
        const projection = projections?.find(
            ({ field }) => field === outcome.field
        );

        if (
            fieldsStanza?.exclude &&
            fieldsStanza.exclude.includes(outcome.field)
        ) {
            updatedSelections[outcome.field] = {
                mode: 'exclude',
                outcome,
                projection,
            };

            return;
        }

        if (
            fieldsStanza &&
            isMaterializationFields(fieldsStanza) &&
            fieldsStanza?.require
        ) {
            const meta = Object.entries(fieldsStanza.require).find(
                ([field, _config]) => field === outcome.field
            )?.[1];

            if (meta !== undefined) {
                updatedSelections[outcome.field] = {
                    meta,
                    mode: 'require',
                    outcome,
                    projection,
                };

                return;
            }
        }

        if (
            fieldsStanza &&
            !isMaterializationFields(fieldsStanza) &&
            fieldsStanza?.include
        ) {
            const meta = Object.entries(fieldsStanza.include).find(
                ([field, _config]) => field === outcome.field
            )?.[1];

            if (meta !== undefined) {
                updatedSelections[outcome.field] = {
                    meta,
                    mode: 'require',
                    outcome,
                    projection,
                };

                return;
            }
        }

        updatedSelections[outcome.field] = {
            mode: isSelectedField(outcome) ? 'default' : null,
            outcome,
            projection,
        };
    });

    return updatedSelections;
};

export const getAlgorithmicFieldSelection = (
    existingFieldSelection: FieldSelectionDictionary,
    outcomes: FieldOutcome[]
): FieldSelectionDictionary => {
    const updatedFields: FieldSelectionDictionary = {};

    outcomes.forEach((outcome) => {
        updatedFields[outcome.field] = {
            meta: existingFieldSelection?.[outcome.field].meta,
            mode: isSelectedField(outcome) ? 'default' : null,
            outcome,
            projection: existingFieldSelection?.[outcome.field].projection,
        };
    });

    return updatedFields;
};
