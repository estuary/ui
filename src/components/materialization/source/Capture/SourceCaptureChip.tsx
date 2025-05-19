import { Box, Chip } from '@mui/material';

import { useIntl } from 'react-intl';

import { truncateTextSx } from 'src/context/Theme';
import useSourceCapture from 'src/hooks/sourceCapture/useSourceCapture';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore_sourceCaptureDefinition } from 'src/stores/SourceCapture/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

function SourceCaptureChip() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const { updateDraft } = useSourceCapture();

    const sourceCaptureDefinition =
        useSourceCaptureStore_sourceCaptureDefinition();

    const saving = useSourceCaptureStore((state) => state.saving);

    const label =
        sourceCaptureDefinition?.capture ??
        intl.formatMessage({
            id: 'workflows.sourceCapture.selected.none',
        });

    return (
        <Chip
            color={sourceCaptureDefinition?.capture ? 'success' : 'info'}
            disabled={saving || formActive}
            label={<Box sx={{ ...truncateTextSx, minWidth: 100 }}>{label}</Box>}
            variant="outlined"
            onDelete={
                sourceCaptureDefinition?.capture
                    ? async () => {
                          await updateDraft(undefined);
                      }
                    : undefined
            }
        />
    );
}

export default SourceCaptureChip;
