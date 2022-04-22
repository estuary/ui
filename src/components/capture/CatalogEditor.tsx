import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { FormattedMessage } from 'react-intl';

function NewCaptureEditor() {
    const id = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

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
