import { Box, Chip, Stack } from '@mui/material';
import { chipOutlinedStyling, truncateTextSx } from 'context/Theme';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import useSourceCapture from '../useSourceCapture';
import SourceCaptureOptionInfo from './SourceCaptureOptionInfo';

function SourceCaptureChip() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const updateDraft = useSourceCapture();

    const [sourceCapture, setSourceCapture, deltaUpdates, targetSchema] =
        useSourceCaptureStore((state) => [
            state.sourceCapture,
            state.setSourceCapture,
            state.deltaUpdates,
            state.targetSchema,
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
            label={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                >
                    <Box sx={{ ...truncateTextSx }}>{label}</Box>
                    {sourceCapture ? (
                        <>
                            {targetSchema === 'fromSourceName' ? (
                                <SourceCaptureOptionInfo messageKey="workflows.sourceCapture.optionalSettings.targetSchema.chip" />
                            ) : null}

                            {deltaUpdates ? (
                                <SourceCaptureOptionInfo messageKey="workflows.sourceCapture.optionalSettings.deltaUpdates.chip" />
                            ) : null}
                        </>
                    ) : null}
                </Stack>
            }
            sx={{
                ...chipOutlinedStyling,
                'height': 'auto',
                '& .MuiChip-label': {
                    display: 'block',
                    whiteSpace: 'normal',
                },
            }}
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
