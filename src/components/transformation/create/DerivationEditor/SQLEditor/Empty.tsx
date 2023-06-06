import { Box, Divider, Typography } from '@mui/material';
import { DEFAULT_HEIGHT } from 'utils/editor-utils';

interface Props {
    editorHeight?: number;
}

function EmptySQLEditor({ editorHeight = DEFAULT_HEIGHT }: Props) {
    return (
        <>
            <Box sx={{ height: 37 }} />

            <Divider />

            <Box sx={{ height: editorHeight, p: 1 }}>
                <Typography>No SQL file selected.</Typography>
            </Box>
        </>
    );
}

export default EmptySQLEditor;
