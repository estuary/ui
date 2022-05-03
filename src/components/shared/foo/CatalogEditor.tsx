import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { EditorStoreState } from 'components/editor/Store';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { useZustandStore } from 'hooks/useZustand';
import { FormattedMessage } from 'react-intl';

interface Props {
    messageId: string;
}

function CatalogEditor({ messageId }: Props) {
    const draftId = useZustandStore<
        EditorStoreState<DraftSpecQuery>,
        EditorStoreState<DraftSpecQuery>['id']
    >((state) => state.id);

    if (draftId) {
        return (
            <>
                <Typography variant="h5">Catalog Editor</Typography>
                <Typography>
                    <FormattedMessage id={messageId} />
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

export default CatalogEditor;
