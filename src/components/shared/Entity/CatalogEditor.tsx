import { Paper, Typography } from '@mui/material';
import DraftSpecEditor from 'components/editor/DraftSpec';
import { useEditorStore_id } from 'components/editor/Store/hooks';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { FormattedMessage, useIntl } from 'react-intl';
import { useLocalStorage } from 'react-use';
import { useBinding_backfilledBindings_count } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'stores/FormState/hooks';
import { FormStatus } from 'stores/FormState/types';
import { LocalStorageKeys } from 'utils/localStorage-utils';
import AlertBox from '../AlertBox';
import ErrorBoundryWrapper from '../ErrorBoundryWrapper';

interface Props {
    messageId: string;
}

function CatalogEditor({ messageId }: Props) {
    const draftId = useEditorStore_id();

    const [dataFlowResetEnabled] = useLocalStorage(
        LocalStorageKeys.ENABLE_DATA_FLOW_RESET
    );

    const formStatus = useFormStateStore_status();
    const formActive = useFormStateStore_isActive();

    const intl = useIntl();
    const backfillDataFlow = useBindingStore((state) => state.backfillDataFlow);
    const needsBackfilled = useBinding_backfilledBindings_count();

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

                    {dataFlowResetEnabled &&
                    backfillDataFlow &&
                    needsBackfilled ? (
                        <AlertBox
                            fitWidth
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
                                    (dataFlowResetEnabled &&
                                        backfillDataFlow &&
                                        needsBackfilled)
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
