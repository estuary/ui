import { Typography } from '@mui/material';
import { MessageComponentProps } from './types';

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
