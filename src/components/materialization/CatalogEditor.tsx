import { Paper, Typography } from '@mui/material';
import DraftEditor from 'components/editor/DraftSpec';
import { EditorStoreState, useZustandStore } from 'components/editor/Store';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { FormattedMessage } from 'react-intl';

function NewMaterializationEditor() {
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

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
