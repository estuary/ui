import { Box } from '@mui/material';
import EditorFileSelector from 'components/draft/editor/FileSelector';
import MonacoEditor from 'components/draft/editor/MonacoEditor';

type Props = {
    currentCatalog: string | null;
    draftId: string | null;
};

function DraftEditor({ currentCatalog, draftId }: Props) {
    return (
        <Box
            sx={{
                flexGrow: 1,
                bgcolor: 'background.paper',
                display: 'flex',
                height: 300,
            }}
        >
            {draftId ? (
                <>
                    <EditorFileSelector draftId={draftId} />
                    {currentCatalog ? (
                        <MonacoEditor
                            draftId={draftId}
                            currentCatalog={currentCatalog}
                        />
                    ) : null}
                </>
            ) : null}
        </Box>
    );
}

export default DraftEditor;
