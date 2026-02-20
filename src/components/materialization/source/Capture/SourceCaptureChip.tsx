import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

import { truncateTextSx } from 'src/context/Theme';
import useSourceCapture from 'src/hooks/sourceCapture/useSourceCapture';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function SourceCaptureChip() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const { updateDraft } = useSourceCapture();

    const sourceCapture = useSourceCaptureStore((state) => state.sourceCapture);

    const saving = useSourceCaptureStore((state) => state.saving);

    const label =
        sourceCapture ??
        intl.formatMessage({
            id: 'workflows.sourceCapture.selected.none',
        });

    return (
        <OutlinedChip
            color={sourceCapture ? 'success' : 'info'}
            disabled={saving || formActive}
            label={
                <Box sx={{ ...truncateTextSx, minWidth: 100, p: 1 }}>
                    {label}
                </Box>
            }
            onDelete={
                sourceCapture
                    ? async () => {
                          await updateDraft(undefined);
                      }
                    : undefined
            }
            style={{
                maxWidth: '50%',
                minHeight: 40,
            }}
            variant="outlined"
        />
    );
}

export default SourceCaptureChip;
