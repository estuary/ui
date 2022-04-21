import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { useZustandStore } from 'components/editor/Store';
import { FormattedMessage } from 'react-intl';

function NewCaptureEditor() {
    const { id } = useZustandStore();

    if (id) {
        return (
            <>
                <Typography variant="h5">Catalog Editor</Typography>
                <Typography>
                    <FormattedMessage id="captureCreation.finalReview.instructions" />
                </Typography>
                <Paper variant="outlined">
                    <DraftSpecEditor />
                </Paper>
            </>
        );
    } else {
        return null;
    }
}

export default NewCaptureEditor;
