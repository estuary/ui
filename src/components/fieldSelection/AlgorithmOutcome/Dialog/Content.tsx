import type { AlgorithmOutcomeContentProps } from 'src/components/fieldSelection/types';
import type { ExpandedFieldSelection } from 'src/stores/Binding/slices/FieldSelection';

import { useMemo } from 'react';

import FieldOutcomes from 'src/components/fieldSelection/AlgorithmOutcome/Dialog/FieldOutcomes';

const AlgorithmOutcomeContent = ({
    fieldSelection,
}: AlgorithmOutcomeContentProps) => {
    const [excludedFields, requiredFields, selectedFields, unselectedFields] =
        useMemo(() => {
            const excluded: ExpandedFieldSelection[] = [];
            const required: ExpandedFieldSelection[] = [];
            const selected: ExpandedFieldSelection[] = [];
            const unselected: ExpandedFieldSelection[] = [];

            Object.entries(fieldSelection).forEach(([field, selection]) => {
                if (selection.mode === 'default' || selection.mode === null) {
                    selected.push({ ...selection, field });

                    return;
                }

                if (selection.mode === 'require') {
                    required.push({ ...selection, field });

                    return;
                }

                if (selection.mode === 'exclude') {
                    excluded.push({ ...selection, field });

                    return;
                }

                unselected.push({ ...selection, field });
            });

            return [excluded, required, selected, unselected];
        }, [fieldSelection]);

    return (
        <>
            <FieldOutcomes
                fields={requiredFields}
                headerMessageId="fieldSelection.reviewDialog.label.require"
                keyPrefix="req"
            />

            <FieldOutcomes
                fields={selectedFields}
                headerMessageId="fieldSelection.reviewDialog.label.select"
                hideBorder={Boolean(
                    excludedFields.length === 0 && unselectedFields.length === 0
                )}
                keyPrefix="sel"
            />

            <FieldOutcomes
                fields={excludedFields}
                headerMessageId="fieldSelection.reviewDialog.label.exclude"
                hideBorder={unselectedFields.length === 0}
                keyPrefix="exc"
            />

            <FieldOutcomes
                fields={unselectedFields}
                headerMessageId="fieldSelection.reviewDialog.label.unselected"
                hideBorder
                keyPrefix="unsel"
            />
        </>
    );
};

export default AlgorithmOutcomeContent;
