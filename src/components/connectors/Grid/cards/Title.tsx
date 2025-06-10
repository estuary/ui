import type { MessageComponentProps } from 'src/components/connectors/Grid/cards/types';

import { Typography } from '@mui/material';

function Title({ content, marginBottom }: MessageComponentProps) {
    return (
        <Typography
            align="left"
            component="div"
            className="connector-title"
            fontSize={18}
            fontWeight="400"
            marginBottom={marginBottom ?? 1}
        >
            {content}
        </Typography>
    );
}

export default Title;
