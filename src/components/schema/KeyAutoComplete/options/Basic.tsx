import { Stack, Typography } from '@mui/material';
import { truncateTextSx } from 'context/Theme';

interface Props {
    pointer: string;
    types: string[];
}

function BasicOption({ pointer, types }: Props) {
    return (
        <Stack component="span" direction="row" spacing={1}>
            <Typography
                component="span"
                sx={{
                    ...truncateTextSx,
                }}
            >
                {pointer}
            </Typography>
            <Typography
                component="span"
                variant="body2"
                sx={{
                    fontFamily: 'Monospace',
                }}
            >
                [{types.join(', ')}]
            </Typography>
        </Stack>
    );
}

export default BasicOption;
