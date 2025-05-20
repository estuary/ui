import { Box, Chip } from '@mui/material';

import { useIntl } from 'react-intl';

import { truncateTextSx } from 'src/context/Theme';
import useSourceCapture from 'src/hooks/sourceCapture/useSourceCapture';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

function SourceCaptureChip() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const { updateDraft } = useSourceCapture();

    const [sourceCapture] = useSourceCaptureStore((state) => [
        state.sourceCapture,
    ]);

    const saving = useSourceCaptureStore((state) => state.saving);

    const label =
        sourceCapture ??
        intl.formatMessage({
            id: 'workflows.sourceCapture.selected.none',
        });

    return (
        <Chip
            color={sourceCapture ? 'success' : 'info'}
            disabled={saving || formActive}
            label={<Box sx={{ ...truncateTextSx, minWidth: 100 }}>{label}</Box>}
            variant="outlined"
            onDelete={
                sourceCapture
                    ? async () => {
                          await updateDraft(undefined);
                      }
                    : undefined
            }
        />
    );
}

export default SourceCaptureChip;
