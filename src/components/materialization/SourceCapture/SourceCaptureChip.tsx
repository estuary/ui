import { Chip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import useSourceCapture from '../useSourceCapture';

function SourceCaptureChip() {
    const formActive = useFormStateStore_isActive();

    const updateDraft = useSourceCapture();

    const [sourceCapture, setSourceCapture] = useSourceCaptureStore((state) => [
        state.sourceCapture,
        state.setSourceCapture,
    ]);

    const saving = useSourceCaptureStore((state) => state.saving);

    const disabled = saving || formActive;

    if (!sourceCapture) {
        return (
            <Chip
                color="info"
                disabled={disabled}
                label={
                    <FormattedMessage id="workflows.sourceCapture.selected.none" />
                }
            />
        );
    }

    return (
        <Chip
            color="success"
            disabled={disabled}
            label={sourceCapture}
            sx={{
                maxWidth: '50%',
            }}
            onDelete={async () => {
                setSourceCapture(null);
                await updateDraft(null);
            }}
        />
    );
}

export default SourceCaptureChip;
