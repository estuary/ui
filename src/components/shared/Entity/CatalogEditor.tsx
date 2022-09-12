import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { useEditorStore_id } from 'components/editor/Store';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState';

interface Props {
    messageId: string;
}

function CatalogEditor({ messageId }: Props) {
    const draftId = useEditorStore_id();

    const formActive = useFormStateStore_isActive();

    if (draftId) {
        return (
            <WrapperWithHeader
                header={
                    <FormattedMessage id="entityCreate.catalogEditor.heading" />
                }
            >
                <>
                    <Typography sx={{ mb: 2 }}>
                        <FormattedMessage id={messageId} />
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <DraftSpecEditor disabled={formActive} />
                    </Paper>
                </>
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CatalogEditor;
