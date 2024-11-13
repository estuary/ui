import { Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { chipOutlinedStyling, truncateTextSx } from 'context/Theme';
import { Check } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import useSourceCapture from '../useSourceCapture';

function SourceCaptureChip() {
    const intl = useIntl();
    const theme = useTheme();
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
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                >
                    <Box sx={{ ...truncateTextSx }}>{label}</Box>
                    {sourceCapture ? (
                        <>
                            {targetSchema === 'fromSourceName' ? (
                                <Stack
                                    direction="row"
                                    style={{
                                        alignItems: 'center',
                                        width: 'min-content',
                                        whiteSpace: 'break-spaces',
                                    }}
                                >
                                    <Typography>
                                        <Check
                                            style={{
                                                fontSize: 14,
                                                color: theme.palette.success
                                                    .main,
                                            }}
                                        />
                                    </Typography>
                                    {intl.formatMessage({
                                        id: `workflows.sourceCapture.optionalSettings.targetSchema.chip`,
                                    })}
                                </Stack>
                            ) : null}

                            {deltaUpdates ? (
                                <Stack
                                    direction="row"
                                    style={{
                                        alignItems: 'center',
                                        width: 'min-content',
                                        whiteSpace: 'break-spaces',
                                    }}
                                >
                                    <Typography>
                                        <Check
                                            style={{
                                                fontSize: 14,
                                                color: theme.palette.success
                                                    .main,
                                            }}
                                        />
                                    </Typography>

                                    {intl.formatMessage({
                                        id: `workflows.sourceCapture.optionalSettings.deltaUpdates.chip`,
                                    })}
                                </Stack>
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
