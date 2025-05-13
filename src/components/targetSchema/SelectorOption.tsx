import type { SelectorOptionProps } from 'src/components/shared/specPropertyEditor/types';
import type { AutoCompleteOption } from 'src/components/targetSchema/types';

import { Stack, Typography } from '@mui/material';

function SelectorOption({ option }: SelectorOptionProps<AutoCompleteOption>) {
    const { description, label } = option;

    return (
        <Stack component="span" spacing={1}>
            <Typography component="span" style={{ fontWeight: 500 }}>
                {label}
            </Typography>

            <Typography
                component="span"
                sx={{
                    pl: 1.5,
                }}
            >
                {description}
            </Typography>

            <Typography
                component="span"
                sx={{
                    pl: 1.5,
                }}
            >
                example goes here
            </Typography>
        </Stack>
    );
}

export default SelectorOption;
