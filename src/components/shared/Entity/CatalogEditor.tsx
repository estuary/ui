import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
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
    const draftId = useEditorStore_id();

    const formStatus = useFormStateStore_status();
    const formActive = useFormStateStore_isActive();

    // TODO (data flow reset)
    // const intl = useIntl();
    // const backfillDataFlow = useBindingStore((state) => state.backfillDataFlow);
    // const needsBackfilled = useBinding_backfilledBindings_count();

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

                    {/*TODO (data flow reset) - also make sure editor is disabled*/}
                    {/*                    {backfillDataFlow && needsBackfilled ? (
                        <AlertBox
                            fitWidth
                            short
                            severity="warning"
                            title={intl.formatMessage({
                                id: 'dataFlowReset.editor.warning.title',
                            })}
                        >
                            {intl.formatMessage({
                                id: 'dataFlowReset.editor.warning.message',
                            })}
                        </AlertBox>
                    ) : null}*/}

                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <DraftSpecEditor
                            disabled={Boolean(
                                formActive
                                // TODO (data flow reset)
                                // || (backfillDataFlow && needsBackfilled)
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
