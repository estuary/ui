import type { MessageComponentProps } from 'src/components/connectors/Grid/cards/types';

import { Stack, Typography } from '@mui/material';

import { diminishedTextColor } from 'src/context/Theme';

function Detail({ content }: MessageComponentProps) {
    return (
        <Stack direction="column" spacing={1} sx={{ alignItems: 'baseline' }}>
            <Typography
                align="left"
                color={(theme) => diminishedTextColor[theme.palette.mode]}
                component="div"
                variant="subtitle1"
            >
                {content}
            </Typography>
        </Stack>
    );
}

export default Detail;
