import type { ExistingKeyProps } from 'src/components/fieldSelection/types';

import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import ChipList from 'src/components/shared/ChipList';

const ExistingKey = ({ labelId, values }: ExistingKeyProps) => {
    const intl = useIntl();

    return (
        <Stack direction="row" spacing={1}>
            <Typography style={{ flexShrink: 0, marginTop: 5 }}>
                {intl.formatMessage({
                    id: labelId,
                })}
            </Typography>

            <div style={{ width: 450 }}>
                <ChipList maxChips={3} stripPath={false} values={values} />
            </div>
        </Stack>
    );
};

export default ExistingKey;
