import { Box, Chip, Stack } from '@mui/material';

import useSourceCapture from '../useSourceCapture';
import SourceCaptureChipOptionalSettings from './SourceCaptureChipOptionalSettings';
import { useIntl } from 'react-intl';

import { chipOutlinedStyling, truncateTextSx } from 'src/context/Theme';
import { useFormStateStore_isActive } from 'src/stores/FormState/hooks';
import { useSourceCaptureStore_sourceCaptureDefinition } from 'src/stores/SourceCapture/hooks';
import { useSourceCaptureStore } from 'src/stores/SourceCapture/Store';

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
        <Chip
            color={sourceCaptureDefinition?.capture ? 'success' : 'info'}
            disabled={saving || formActive}
            label={
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{
                        alignItems: 'center',
                        pr: sourceCaptureDefinition?.capture ? 3 : undefined,
                    }}
                >
                    <Box sx={{ ...truncateTextSx, minWidth: 100 }}>{label}</Box>
                    <SourceCaptureChipOptionalSettings />
                </Stack>
            }
            sx={{
                ...chipOutlinedStyling,
                'height': 'auto',
                'maxWidth': '50%',
                'py': 1,
                '& .MuiChip-label': {
                    display: 'block',
                    whiteSpace: 'normal',
                },
                // Just force a minwidth so the chip cannot shrink so much that the
                //  content is invisible under the delete icon
                'minWidth': sourceCaptureDefinition?.capture ? 375 : undefined,

                // This is hacky but is needed as this chip has extra content and was
                //  causing the SVG to resize and shrink if the chip got narrow
                //  while the content was wide
                '& svg': {
                    minHeight: 21,
                    minWidth: 21,
                },
            }}
            variant="outlined"
            onDelete={
                sourceCaptureDefinition?.capture
                    ? async () => {
                          resetState();
                          await updateDraft(null);
                      }
                    : undefined
            }
        />
    );
}

export default SourceCaptureChip;
