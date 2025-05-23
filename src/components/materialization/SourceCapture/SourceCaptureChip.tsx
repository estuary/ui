import { Box, Stack } from '@mui/material';

import { useIntl } from 'react-intl';

import SourceCaptureChipOptionalSettings from 'src/components/materialization/SourceCapture/SourceCaptureChipOptionalSettings';
import useSourceCapture from 'src/components/materialization/useSourceCapture';
import { truncateTextSx } from 'src/context/Theme';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore_sourceCaptureDefinition } from 'src/stores/SourceCapture/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';
import { OutlinedChip } from 'src/styledComponents/chips/OutlinedChip';

function SourceCaptureChip() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const { updateDraft } = useSourceCapture();

    const sourceCaptureDefinition =
        useSourceCaptureStore_sourceCaptureDefinition();

    const [resetState] = useSourceCaptureStore((state) => [state.resetState]);

    const saving = useSourceCaptureStore((state) => state.saving);

    const label =
        sourceCaptureDefinition?.capture ??
        intl.formatMessage({
            id: 'workflows.sourceCapture.selected.none',
        });

    return (
        <OutlinedChip
            color={sourceCaptureDefinition?.capture ? 'success' : 'info'}
            disabled={saving || formActive}
            label={
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{
                        alignItems: 'center',
                        pr: sourceCaptureDefinition?.capture ? 3 : undefined,
                        py: 1,
                    }}
                >
                    <Box sx={{ ...truncateTextSx, minWidth: 100 }}>{label}</Box>

                    <SourceCaptureChipOptionalSettings />
                </Stack>
            }
            onDelete={
                sourceCaptureDefinition?.capture
                    ? async () => {
                          resetState();
                          await updateDraft(null);
                      }
                    : undefined
            }
            style={{
                maxWidth: '50%',
                minWidth: sourceCaptureDefinition?.capture ? 375 : undefined,
            }}
            variant="outlined"
        />
    );
}

export default SourceCaptureChip;
