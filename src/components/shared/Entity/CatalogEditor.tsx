import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'src/components/editor/DraftSpec';
import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import { FormattedMessage, useIntl } from 'react-intl';
import { useBinding_backfilledBindings_count } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';
import AlertBox from '../AlertBox';
import ErrorBoundryWrapper from '../ErrorBoundryWrapper';

interface Props {
    messageId: string;
}

function CatalogEditor({ messageId }: Props) {
    const draftId = useEditorStore_id();

    const formStatus = useFormStateStore_status();
    const formActive = useFormStateStore_isActive();

    const intl = useIntl();
    const backfillDataFlow = useBindingStore((state) => state.backfillDataFlow);
    const backfillCount = useBinding_backfilledBindings_count();

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

                    {backfillDataFlow && backfillCount ? (
                        <AlertBox
                            sx={{
                                maxWidth: 'fit-content',
                            }}
                            short
                            severity="warning"
                            title={intl.formatMessage({
                                id: 'resetDataFlow.editor.warning.title',
                            })}
                        >
                            {intl.formatMessage({
                                id: 'resetDataFlow.editor.warning.message',
                            })}
                        </AlertBox>
                    ) : null}

                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <DraftSpecEditor
                            disabled={Boolean(
                                formActive ||
                                    (backfillDataFlow && backfillCount)
                            )}
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
