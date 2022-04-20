import { Paper, Typography } from '@mui/material';
import DraftEditor from 'components/editor';
import { editorStoreSelectors, useEditorStore } from 'components/editor/Store';
import { FormattedMessage } from 'react-intl';

function NewCaptureEditor() {
    const draftId = useEditorStore(editorStoreSelectors.id);

    if (draftId) {
        return (
            <>
                <Typography variant="h5">Catalog Editor</Typography>
                <Typography>
                    <FormattedMessage id="captureCreation.finalReview.instructions" />
                </Typography>
                <Paper variant="outlined">
                    <DraftEditor />
                </Paper>
            </>
        );
    } else {
        return null;
    }
}

export default NewCaptureEditor;
