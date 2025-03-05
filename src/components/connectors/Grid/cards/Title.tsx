import { Typography } from '@mui/material';
import { MessageComponentProps } from './types';

function Title({ content, marginBottom }: MessageComponentProps) {
    return (
        <Typography
            component="div"
            marginBottom={marginBottom ?? 1}
            fontSize={18}
            fontWeight="400"
            align="left"
        >
            {content}
        </Typography>
    );
}

export default Title;
