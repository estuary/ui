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

import { RejectReason, SelectReason } from 'src/types/wasm';

export const DEFAULT_RECOMMENDED_FLAG: BaseMaterializationFields['recommended'] = 1;

export const canRecommendFields = (
    recommendedFlag: BaseMaterializationFields['recommended'] | undefined
): boolean => recommendedFlag !== false;

export const isRequireOnlyField = (outcome: FieldOutcome): boolean => {
    if (outcome?.reject || !outcome?.select) {
        return false;
    }

    return [
        SelectReason.GROUP_BY_KEY,
        SelectReason.CURRENT_DOCUMENT,
        SelectReason.CONNECTOR_REQUIRES,
        SelectReason.PARTITION_KEY,
        SelectReason.CONNECTOR_REQUIRES_LOCATION,
    ].includes(outcome.select.reason);
};

export const isRecommendedField = (outcome: FieldOutcome): boolean => {
    return Boolean(!outcome?.reject && outcome?.select);
};

export const isExcludeOnlyField = (outcome: FieldOutcome): boolean => {
    if (outcome?.select || !outcome?.reject) {
        return false;
    }

    return (
        outcome.reject.reason === RejectReason.CONNECTOR_FORBIDS ||
        outcome.reject.reason === RejectReason.CONNECTOR_UNSATISFIABLE
    );
};

export const isUnselectedField = (outcome: FieldOutcome): boolean => {
    return Boolean(
        !outcome?.select && outcome?.reject && !isExcludeOnlyField(outcome)
    );
};

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

    if (fieldsStanza) {
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

            const recommended = canRecommendFields(fieldsStanza.recommended);

            updatedSelections[outcome.field] = {
                mode:
                    !recommended && isRequireOnlyField(outcome)
                        ? 'require'
                        : recommended && isRecommendedField(outcome)
                          ? 'default'
                          : null,
                outcome,
                projection,
            };
        });
    } else {
        outcomes.forEach((outcome) => {
            const projection = projections?.find(
                ({ field }) => field === outcome.field
            );

            updatedSelections[outcome.field] = {
                mode: isExcludeOnlyField(outcome)
                    ? 'exclude'
                    : isRecommendedField(outcome)
                      ? 'default'
                      : null,
                outcome,
                projection,
            };
        });
    }

    return updatedSelections;
};

export const getAlgorithmicFieldSelection = (
    existingFieldSelection: FieldSelectionDictionary,
    outcomes: FieldOutcome[],
    recommendedFlag: boolean | number
): FieldSelectionDictionary => {
    const updatedFields: FieldSelectionDictionary = {};

    outcomes.forEach((outcome) => {
        let selectionType: FieldSelectionType | null = null;

        if (canRecommendFields(recommendedFlag)) {
            selectionType = isExcludeOnlyField(outcome)
                ? 'exclude'
                : isRecommendedField(outcome)
                  ? 'default'
                  : null;
        } else {
            selectionType = isRequireOnlyField(outcome)
                ? 'require'
                : isExcludeOnlyField(outcome)
                  ? 'exclude'
                  : null;
        }

        updatedFields[outcome.field] = {
            meta: existingFieldSelection?.[outcome.field].meta,
            mode: selectionType,
            outcome,
            projection: existingFieldSelection?.[outcome.field].projection,
        };
    });

    return updatedFields;
};
