import { Chip } from '@mui/material';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import useSourceCapture from '../useSourceCapture';

function SourceCaptureChip() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const updateDraft = useSourceCapture();

    const [sourceCapture, setSourceCapture] = useSourceCaptureStore((state) => [
        state.sourceCapture,
        state.setSourceCapture,
    ]);

    const saving = useSourceCaptureStore((state) => state.saving);

    return (
        <Chip
            color={sourceCapture ? 'success' : 'info'}
            disabled={saving || formActive}
            label={
                sourceCapture ??
                intl.formatMessage({
                    id: 'workflows.sourceCapture.selected.none',
                })
            }
            variant="outlined"
            style={{ maxWidth: '50%' }}
            onDelete={
                sourceCapture
                    ? async () => {
                          setSourceCapture(null);
                          await updateDraft(null);
                      }
                    : undefined
            }
        />
    );
}

export default SourceCaptureChip;
