import type { FieldOutcomeProps } from 'src/components/fieldSelection/AlgorithmOutcome/types';

import { Stack, Typography } from '@mui/material';

import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

const FieldOutcome = ({ fields, keyPrefix, outcomes }: FieldOutcomeProps) => {
    return (
        <Stack spacing={1} style={{ marginLeft: 8 }}>
            {fields.map((field) => {
                const fieldOutcome = outcomes.find(
                    (outcome) => outcome.field === field
                );

                return (
                    <Stack
                        direction="row"
                        key={`${keyPrefix}-${field}`}
                        spacing={1}
                    >
                        <OutlinedChip label={field} variant="outlined" />

                        {fieldOutcome?.select || fieldOutcome?.reject ? (
                            <Typography>
                                {fieldOutcome.select?.detail ??
                                    fieldOutcome.reject?.detail}
                            </Typography>
                        ) : null}
                    </Stack>
                );
            })}
        </Stack>
    );
};

export default FieldOutcome;
