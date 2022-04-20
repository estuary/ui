import { Box } from '@mui/material';
import EditorFileSelector from 'components/editor/FileSelector';

function LiveSpecEditor() {
    return (
        <Box
            sx={{
                flexGrow: 1,
                bgcolor: 'background.paper',
                display: 'flex',
                height: 300,
            }}
        >
            <EditorFileSelector />
            {/* <MonacoEditor disabled={true} /> */}
        </Box>
    );
}

export default LiveSpecEditor;
