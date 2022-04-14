import { Paper, Typography } from '@mui/material';
import DraftEditor from 'components/draft/editor';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import { FormattedMessage } from 'react-intl';

function NewCaptureEditor() {
    const draftId = useEditorStore(editorStoreSelectors.draftId);

    return (
        <>
            <Typography variant="h5">Catalog Editor</Typography>
            <Typography>
                {draftId ? (
                    <FormattedMessage id="captureCreation.finalReview.instructions" />
                ) : (
                    <FormattedMessage id="captureCreation.editor.default" />
                )}
            </Typography>
            <Paper variant="outlined">
                <DraftEditor />
            </Paper>
        </>
    );
}

export default NewCaptureEditor;
