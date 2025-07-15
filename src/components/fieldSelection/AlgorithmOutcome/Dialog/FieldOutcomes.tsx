import type { FieldOutcomesProps } from 'src/components/fieldSelection/AlgorithmOutcome/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

const FieldOutcomes = ({
    fields,
    headerMessageId,
    hideBorder,
    keyPrefix,
    outcomes,
}: FieldOutcomesProps) => {
    const intl = useIntl();

    if (fields.length === 0) {
        return null;
    }

    return (
        <WrapperWithHeader
            header={
                <Typography style={{ fontWeight: 500 }}>
                    {intl.formatMessage(
                        { id: headerMessageId },
                        { count: fields.length }
                    )}
                </Typography>
            }
            hideBorder={Boolean(hideBorder)}
            readOnly
        >
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
        </WrapperWithHeader>
    );
};

export default FieldOutcomes;
