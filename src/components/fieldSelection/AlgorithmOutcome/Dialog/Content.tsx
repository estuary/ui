import type { AlgorithmOutcomeContentProps } from 'src/components/fieldSelection/types';
import type { ExpandedFieldSelection } from 'src/stores/Binding/slices/FieldSelection';

import { useMemo } from 'react';

import FieldOutcomes from 'src/components/fieldSelection/AlgorithmOutcome/Dialog/FieldOutcomes';
import { isSelectedField } from 'src/utils/fieldSelection-utils';

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
                if (
                    selection.mode === 'default' ||
                    (selection.mode === null &&
                        isSelectedField(selection.outcome))
                ) {
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
                selections={requiredFields}
                headerMessageId="fieldSelection.reviewDialog.label.require"
                keyPrefix="req"
            />

            <FieldOutcomes
                selections={selectedFields}
                headerMessageId="fieldSelection.reviewDialog.label.select"
                hideBorder={Boolean(
                    excludedFields.length === 0 && unselectedFields.length === 0
                )}
                keyPrefix="sel"
            />

            <FieldOutcomes
                selections={excludedFields}
                headerMessageId="fieldSelection.reviewDialog.label.exclude"
                hideBorder={unselectedFields.length === 0}
                keyPrefix="exc"
            />

            <FieldOutcomes
                selections={unselectedFields}
                headerMessageId="fieldSelection.reviewDialog.label.unselected"
                hideBorder
                keyPrefix="unsel"
            />
        </>
    );
};

export default AlgorithmOutcomeContent;
