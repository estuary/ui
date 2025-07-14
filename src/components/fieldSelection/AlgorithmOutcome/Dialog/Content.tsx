import type { AlgorithmOutcomeContentProps } from 'src/components/fieldSelection/AlgorithmOutcome/types';

import { Typography } from '@mui/material';

import FieldOutcome from 'src/components/fieldSelection/AlgorithmOutcome/Dialog/FieldOutcome';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';

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
            {requiredFields.length > 0 ? (
                <WrapperWithHeader
                    header={
                        <Typography>
                            Required: {requiredFields.length}
                        </Typography>
                    }
                    readOnly
                >
                    <FieldOutcome
                        fields={requiredFields}
                        keyPrefix="req"
                        outcomes={outcomes}
                    />
                </WrapperWithHeader>
            ) : null}

            {selectedFields.length > 0 ? (
                <WrapperWithHeader
                    header={
                        <Typography>
                            Selected: {selectedFields.length}
                        </Typography>
                    }
                    hideBorder={Boolean(
                        excludedFields.length === 0 &&
                            unselectedFields.length === 0
                    )}
                    readOnly
                >
                    <FieldOutcome
                        fields={selectedFields}
                        keyPrefix="sel"
                        outcomes={outcomes}
                    />
                </WrapperWithHeader>
            ) : null}

            {excludedFields.length > 0 ? (
                <WrapperWithHeader
                    header={
                        <Typography>
                            Excluded: {excludedFields.length}
                        </Typography>
                    }
                    hideBorder={unselectedFields.length === 0}
                    readOnly
                >
                    <FieldOutcome
                        fields={excludedFields}
                        keyPrefix="exc"
                        outcomes={outcomes}
                    />
                </WrapperWithHeader>
            ) : null}

            {unselectedFields.length > 0 ? (
                <WrapperWithHeader
                    header={
                        <Typography>
                            Unselected: {unselectedFields.length}
                        </Typography>
                    }
                    hideBorder
                    readOnly
                >
                    <FieldOutcome
                        fields={unselectedFields}
                        keyPrefix="unsel"
                        outcomes={outcomes}
                    />
                </WrapperWithHeader>
            ) : null}
        </>
    );
};

export default AlgorithmOutcomeContent;
