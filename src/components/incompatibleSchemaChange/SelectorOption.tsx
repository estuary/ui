import { Stack, Typography } from '@mui/material';

import type { SelectorOptionProps } from 'src/components/incompatibleSchemaChange/types';

function SelectorOption({ option }: SelectorOptionProps) {
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
        </Stack>
    );
}

export default SelectorOption;
