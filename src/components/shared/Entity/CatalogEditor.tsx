import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { EditorStoreState } from 'components/editor/Store';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
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
            <WrapperWithHeader
                header={<FormattedMessage id="foo.catalogEditor.heading" />}
            >
                <>
                    <Typography>
                        <FormattedMessage id={messageId} />
                    </Typography>
                    <Paper
                        variant="outlined"
                        sx={{
                            padding: 1,
                        }}
                    >
                        <DraftSpecEditor />
                    </Paper>
                </>
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CatalogEditor;
