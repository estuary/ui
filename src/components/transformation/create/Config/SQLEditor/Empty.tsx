import { Box, Divider, Typography } from '@mui/material';

import { defaultOutline } from 'src/context/Theme';
import { DEFAULT_HEIGHT } from 'src/utils/editor-utils';

interface Props {
    editorHeight?: number;
}

function EmptySQLEditor({ editorHeight = DEFAULT_HEIGHT }: Props) {
    return (
        <Box sx={{ border: (theme) => defaultOutline[theme.palette.mode] }}>
            <Box sx={{ height: 29 }} />

            <Divider />

            <Box sx={{ height: editorHeight, p: 1 }}>
                <Typography>No transform selected.</Typography>
            </Box>
        </Box>
    );
}

export default EmptySQLEditor;
