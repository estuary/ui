import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { FormattedMessage, useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import AlertBox from '../AlertBox';
import ErrorBoundryWrapper from '../ErrorBoundryWrapper';

interface Props {
    messageId: string;
}

function CatalogEditor({ messageId }: Props) {
    const intl = useIntl();

    const draftId = useEditorStore_id();

    const formStatus = useFormStateStore_status();
    const formActive = useFormStateStore_isActive();
    const backfillDataFlow = useBindingStore((state) => state.backfillDataFlow);

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

                    {backfillDataFlow ? (
                        <AlertBox
                            fitWidth
                            short
                            severity="warning"
                            title={intl.formatMessage({
                                id: 'dataflowReset.editor.warning.title',
                            })}
                        >
                            {intl.formatMessage({
                                id: 'dataflowReset.editor.warning.message',
                            })}
                        </AlertBox>
                    ) : null}

                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <DraftSpecEditor
                            disabled={formActive || backfillDataFlow}
                            monitorCurrentCatalog
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
