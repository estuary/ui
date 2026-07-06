import { Paper, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DraftSpecEditor from 'src/components/editor/DraftSpec';
import { useEditorStore_id } from 'src/components/editor/Store/hooks';
import AlertBox from 'src/components/shared/AlertBox';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useBinding_backfilledBindings_count } from 'src/stores/Binding/hooks';
import { useBindingStore } from 'src/stores/Binding/Store';
import {
    useFormStateStore_isActive,
    useFormStateStore_status,
} from 'src/stores/FormState/hooks';
import { FormStatus } from 'src/stores/FormState/types';

interface Props {
    message: string;
}

function CatalogEditor({ message }: Props) {
    const draftId = useEditorStore_id();

    const formStatus = useFormStateStore_status();
    const formActive = useFormStateStore_isActive();

    const backfillMode = useBindingStore((state) => state.backfillMode);
    const backfillCount = useBinding_backfilledBindings_count();

    if (draftId && formStatus !== FormStatus.INIT) {
        const editorDisabled = Boolean(
            backfillMode === 'reset' && backfillCount
        );

        return (
            <WrapperWithHeader
                header={
                    <Typography component="span" variant="subtitle1">
                        Advanced Specification Editor
                    </Typography>
                }
                hideBorder
                mountClosed
            >
                <ErrorBoundryWrapper>
                    <Typography sx={{ mb: 2 }}>{message}</Typography>

                    {editorDisabled ? (
                        <AlertBox
                            sx={{
                                maxWidth: 'fit-content',
                            }}
                            short
                            severity="warning"
                            title="Editing disabled"
                        >
                            While backfilling the data flow you cannot manually
                            edit your spec.
                        </AlertBox>
                    ) : null}

                    <Paper variant="outlined" sx={{ p: 1 }}>
                        <DraftSpecEditor
                            disabled={Boolean(formActive || editorDisabled)}
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

/** @deprecated Prefer the named `CatalogEditor` export */
function CatalogEditorWrapper({ messageId }: { messageId: string }) {
    const intl = useIntl();

    return <CatalogEditor message={intl.formatMessage({ id: messageId })} />;
}

export default CatalogEditorWrapper;
