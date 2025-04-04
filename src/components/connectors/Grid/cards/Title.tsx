import type { MessageComponentProps } from 'src/components/connectors/Grid/cards/types';

import { Typography } from '@mui/material';

function Title({ content, height, marginBottom }: MessageComponentProps) {
    return (
        <Typography
            align="left"
            component="div"
            fontSize={18}
            fontWeight="400"
            height={height}
            marginBottom={marginBottom ?? 1}
        >
            {content}
        </Typography>
    );
}

export default Title;
