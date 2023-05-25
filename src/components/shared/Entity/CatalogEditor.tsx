import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { useEntityType } from 'context/EntityContext';
import { FormattedMessage } from 'react-intl';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import ErrorBoundryWrapper from '../ErrorBoundryWrapper';

interface Props {
    messageId: string;
}

function CatalogEditor({ messageId }: Props) {
    const entityType = useEntityType();

    const draftId = useEditorStore_id();

    const formStatus = useFormStateStore_status();
    const formActive = useFormStateStore_isActive();

    if (draftId && formStatus !== FormStatus.INIT) {
        return (
            <WrapperWithHeader
                header={
                    <Typography variant="subtitle1">
                        <FormattedMessage id="entityCreate.catalogEditor.heading" />
                    </Typography>
                }
                hideBorder
                mountClosed
            >
                <ErrorBoundryWrapper>
                    <Typography sx={{ mb: 2 }}>
                        <FormattedMessage id={messageId} />
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <DraftSpecEditor
                            entityType={entityType}
                            disabled={formActive}
                        />
                    </Paper>
                </ErrorBoundryWrapper>
            </WrapperWithHeader>
        );
    } else {
        return null;
    }
}

export default CatalogEditor;
