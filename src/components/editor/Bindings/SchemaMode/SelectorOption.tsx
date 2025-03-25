import { Stack, Typography } from '@mui/material';
import type { SelectorOptionProps } from './types';

function SelectorOption({ option }: SelectorOptionProps) {
    const { description, label } = option;

    return (
        <Stack component="span" spacing={1}>
            <Typography component="span">{label}</Typography>
            <Typography
                component="span"
                variant="caption"
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
