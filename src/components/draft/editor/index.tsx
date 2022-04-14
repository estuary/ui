import { Box } from '@mui/material';
import EditorFileSelector from 'components/draft/editor/FileSelector';
import MonacoEditor from 'components/draft/editor/MonacoEditor';

function DraftEditor() {
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
            <MonacoEditor />
        </Box>
    );
}

export default DraftEditor;
