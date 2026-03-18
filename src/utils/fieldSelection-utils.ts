import type { FieldSelectionType } from 'src/components/fieldSelection/types';
import type { ExpandedFieldSelection } from 'src/components/tables/FieldSelection/types';
import type {
    BindingFieldSelection,
    FieldSelectionDictionary,
    SelectionAlgorithm,
} from 'src/stores/Binding/slices/FieldSelection';
import type {
    BaseMaterializationFields,
    BuiltProjection,
    MaterializationFields,
    MaterializationFields_Legacy,
} from 'src/types/schemaModels';
import type { FieldOutcome } from 'src/types/wasm';

export const DEFAULT_RECOMMENDED_FLAG: BaseMaterializationFields['recommended'] =
    true;

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
    projections?: BuiltProjection[]
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
                field: outcome.field,
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
                    field: outcome.field,
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
                    field: outcome.field,
                    meta,
                    mode: 'require',
                    outcome,
                    projection,
                };

                return;
            }
        }

        updatedSelections[outcome.field] = {
            field: outcome.field,
            mode: isSelectedField(outcome) ? 'default' : null,
            outcome,
            projection,
        };
    });

    return updatedSelections;
};

export const getExpandedFieldSelection = (
    selections: BindingFieldSelection | undefined
): ExpandedFieldSelection[] =>
    selections
        ? Object.values(selections.value).map((selection) => ({
              ...selection,
              isGroupByKey:
                  selections.groupBy.value.explicit.length > 0
                      ? selections.groupBy.value.explicit.includes(
                            selection.field
                        )
                      : selections.groupBy.value.implicit.includes(
                            selection.field
                        ),
          }))
        : [];

export const mapRecommendedValueToAlgorithm = (
    value: boolean | number | null | undefined
): SelectionAlgorithm | null => {
    switch (value) {
        case 0: {
            return 'depthZero';
        }
        case 1: {
            return 'depthOne';
        }
        case 2: {
            return 'depthTwo';
        }
        case true: {
            return 'depthUnlimited';
        }
        default: {
            return null;
        }
    }
};

export const mapAlgorithmToRecommendedValue = (
    value: SelectionAlgorithm | null | undefined,
    fieldsRecommended: boolean | number | undefined
): boolean | number => {
    switch (value) {
        case 'depthZero': {
            return 0;
        }
        case 'depthOne': {
            return 1;
        }
        case 'depthTwo': {
            return 2;
        }
        case 'depthUnlimited': {
            return true;
        }
        default: {
            return fieldsRecommended ?? DEFAULT_RECOMMENDED_FLAG;
        }
    }
};
