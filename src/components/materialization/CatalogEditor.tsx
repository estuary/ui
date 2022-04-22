import { Paper, Typography } from '@mui/material';
import DraftEditor from 'components/draft/editor';
import useEditorStore, {
    editorStoreSelectors,
} from 'components/draft/editor/Store';
import { FormattedMessage } from 'react-intl';

function NewMaterializationEditor() {
    const draftId = useEditorStore(editorStoreSelectors.draftId);

    if (draftId) {
        return (
            <>
                <Typography variant="h5">Catalog Editor</Typography>

                <Typography>
                    <FormattedMessage id="materializationCreation.finalReview.instructions" />
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

export default NewMaterializationEditor;
