import { Paper, Typography } from '@mui/material';
import DraftEditor from 'components/draft/editor';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import { FormattedMessage } from 'react-intl';

function NewCaptureEditor() {
    const draftId = useEditorStore(editorStoreSelectors.draftId);
    const currentCatalog = useEditorStore(editorStoreSelectors.currentCatalog);

    if (draftId) {
        return (
            <>
                <Typography variant="h5">Catalog Editor</Typography>
                <Typography>
                    <FormattedMessage id="captureCreation.finalReview.instructions" />
                </Typography>
                <Paper variant="outlined">
                    <DraftEditor
                        currentCatalog={currentCatalog}
                        draftId={draftId}
                    />
                </Paper>
            </>
        );
    } else {
        return null;
    }
}

export default NewCaptureEditor;
