import type { FieldOutcomesProps } from 'src/components/fieldSelection/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

const FieldOutcomes = ({
    headerMessageId,
    hideBorder,
    keyPrefix,
    selections,
}: FieldOutcomesProps) => {
    const intl = useIntl();

    if (selections.length === 0) {
        return null;
    }

    return (
        <WrapperWithHeader
            header={
                <Typography style={{ fontWeight: 500 }}>
                    {intl.formatMessage(
                        { id: headerMessageId },
                        { count: selections.length }
                    )}
                </Typography>
            }
            hideBorder={Boolean(hideBorder)}
            readOnly
        >
            <Stack spacing={1} style={{ marginLeft: 8 }}>
                {selections.map(({ field, outcome }) => {
                    return (
                        <Stack
                            direction="row"
                            key={`${keyPrefix}-${field}`}
                            spacing={1}
                        >
                            <OutlinedChip
                                color={
                                    outcome?.select && outcome?.reject
                                        ? 'warning'
                                        : undefined
                                }
                                label={field}
                                variant="outlined"
                            />

                            {outcome?.select || outcome?.reject ? (
                                <Typography>
                                    {outcome.select?.detail ??
                                        outcome.reject?.detail}
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
