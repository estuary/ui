import type { MessageComponentProps } from 'src/components/connectors/Grid/cards/types';

import { Stack, Typography } from '@mui/material';

function Detail({ content }: MessageComponentProps) {
    return (
        <Stack direction="column" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography align="left" component="div" variant="subtitle1">
                {content}
            </Typography>
        </Stack>
    );
}

export default Detail;
