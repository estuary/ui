import { Paper, Typography } from '@mui/material';
import DraftEditor from 'components/draft/editor';
import { FormattedMessage } from 'react-intl';

function NewCaptureEditor() {
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
}

export default NewCaptureEditor;
