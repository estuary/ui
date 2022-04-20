import { Box } from '@mui/material';
import EditorFileSelector from 'components/draft/editor/FileSelector';
import MonacoEditor from 'components/draft/editor/MonacoEditor';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import useDraftSpecs from 'hooks/useDraftSpecs';
import { useEffect } from 'react';

function DraftEditor() {
    const setDraftSpecs = useEditorStore(editorStoreSelectors.setSpecs);
    const draftId = useEditorStore(editorStoreSelectors.draftId);
    const { draftSpecs } = useDraftSpecs(draftId);

    useEffect(() => {
        setDraftSpecs(draftSpecs);
    }, [draftSpecs, setDraftSpecs]);

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
