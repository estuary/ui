import { Stack, Typography } from '@mui/material';
import { MessageComponentProps } from './types';

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
