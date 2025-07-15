import type { AlgorithmOutcomeContentProps } from 'src/components/fieldSelection/AlgorithmOutcome/types';

import FieldOutcomes from 'src/components/fieldSelection/AlgorithmOutcome/Dialog/FieldOutcomes';

const AlgorithmOutcomeContent = ({
    fieldSelection,
    outcomes,
}: AlgorithmOutcomeContentProps) => {
    const selectedFields: string[] = Object.entries(fieldSelection)
        .filter(([_field, selection]) => selection.mode === 'default')
        .map(([field, _selection]) => field);

    const requiredFields: string[] = Object.entries(fieldSelection)
        .filter(([_field, selection]) => selection.mode === 'require')
        .map(([field, _selection]) => field);

    const excludedFields: string[] = Object.entries(fieldSelection)
        .filter(([_field, selection]) => selection.mode === 'exclude')
        .map(([field, _selection]) => field);

    const unselectedFields: string[] = Object.entries(fieldSelection)
        .filter(([_field, selection]) => selection.mode === null)
        .map(([field, _selection]) => field);

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
