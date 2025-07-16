import type { AlgorithmOutcomeContentProps } from 'src/components/fieldSelection/types';

import { useMemo } from 'react';

import { ConstraintTypes } from 'src/components/editor/Bindings/FieldSelection/types';
import FieldOutcomes from 'src/components/fieldSelection/AlgorithmOutcome/Dialog/FieldOutcomes';

const AlgorithmOutcomeContent = ({
    fieldSelection,
    outcomes,
}: AlgorithmOutcomeContentProps) => {
    const [excludedFields, requiredFields, selectedFields, unselectedFields] =
        useMemo(() => {
            const excluded: string[] = [];
            const required: string[] = [];
            const selected: string[] = [];
            const unselected: string[] = [];

            Object.entries(fieldSelection).forEach(([field, selection]) => {
                if (
                    (selection.mode === 'default' || selection.mode === null) &&
                    selection?.constraintType !==
                        ConstraintTypes.FIELD_OPTIONAL &&
                    selection?.constraintType !== ConstraintTypes.UNSATISFIABLE
                ) {
                    selected.push(field);

                    return;
                }

                if (
                    selection.mode === 'require' &&
                    selection?.constraintType !== ConstraintTypes.UNSATISFIABLE
                ) {
                    required.push(field);

                    return;
                }

                if (
                    selection.mode === 'exclude' &&
                    selection?.constraintType !== ConstraintTypes.UNSATISFIABLE
                ) {
                    excluded.push(field);

                    return;
                }

                unselected.push(field);
            });

            return [excluded, required, selected, unselected];
        }, [fieldSelection]);

    return (
        <>
            <FieldOutcomes
                fields={requiredFields}
                headerMessageId="fieldSelection.reviewDialog.label.require"
                keyPrefix="req"
                outcomes={outcomes}
            />

            <FieldOutcomes
                fields={selectedFields}
                headerMessageId="fieldSelection.reviewDialog.label.select"
                hideBorder={Boolean(
                    excludedFields.length === 0 && unselectedFields.length === 0
                )}
                keyPrefix="sel"
                outcomes={outcomes}
            />

            <FieldOutcomes
                fields={excludedFields}
                headerMessageId="fieldSelection.reviewDialog.label.exclude"
                hideBorder={unselectedFields.length === 0}
                keyPrefix="exc"
                outcomes={outcomes}
            />

            <FieldOutcomes
                fields={unselectedFields}
                headerMessageId="fieldSelection.reviewDialog.label.unselected"
                hideBorder
                keyPrefix="unsel"
                outcomes={outcomes}
            />
        </>
    );
};

export default AlgorithmOutcomeContent;
