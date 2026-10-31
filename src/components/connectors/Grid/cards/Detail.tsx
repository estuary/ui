import type { MessageComponentProps } from 'src/components/connectors/Grid/cards/types';

import { Stack, Typography, useTheme } from '@mui/material';

function Detail({ content }: MessageComponentProps) {
    const theme = useTheme();
    return (
        <Stack direction="column" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography
                align="left"
                color={theme.palette.text.diminished}
                component="div"
                variant="subtitle1"
            >
                {content}
            </Typography>
        </Stack>
    );
}

export default Detail;
