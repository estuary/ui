import { Box, Chip, Divider, Stack } from '@mui/material';
import { chipOutlinedStyling, truncateTextSx } from 'context/Theme';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import useSourceCapture from '../useSourceCapture';

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
                <Stack>
                    <Box sx={{ ...truncateTextSx, fontweight: 700 }}>
                        {label}
                    </Box>
                    {sourceCapture ? (
                        <>
                            <Divider />
                            <Box>
                                {intl.formatMessage({
                                    id: `workflows.sourceCapture.optionalSettings.${targetSchema}.chip`,
                                })}
                            </Box>
                            {deltaUpdates ? (
                                <Box>
                                    {intl.formatMessage({
                                        id: `workflows.sourceCapture.optionalSettings.deltaUpdates.chip`,
                                    })}
                                </Box>
                            ) : null}
                        </>
                    ) : null}
                </Stack>
            }
            sx={{
                ...chipOutlinedStyling,
                height: 'auto',
            }}
            variant="outlined"
            style={{ maxWidth: '35%' }}
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
