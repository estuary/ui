import { Stack, Typography } from '@mui/material';

import { truncateTextSx } from 'src/context/Theme';

interface Props {
    pointer: string;
    types: string[];
}

function BasicOption({ pointer, types }: Props) {
    return (
        <Stack direction="row" style={{ alignItems: 'center' }}>
            <Typography
                component="span"
                sx={{
                    ...truncateTextSx,
                    fontWeight: 500,
                    marginBottom: '4px',
                }}
            >
                {pointer}
            </Typography>

            <Typography
                component="span"
                style={{
                    fontFamily: 'monospace',
                    marginLeft: 8,
                }}
                variant="body2"
            >
                [{types.join(', ')}]
            </Typography>
        </Stack>
    );
}

export default BasicOption;
