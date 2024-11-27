import { Box, Chip, Stack } from '@mui/material';
import { chipOutlinedStyling, truncateTextSx } from 'context/Theme';
import { useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';
import { useFormStateStore_isActive } from 'stores/FormState/hooks';
import { useSourceCaptureStore } from 'stores/SourceCapture/Store';
import useSourceCapture from '../useSourceCapture';
import SourceCaptureOptionInfo from './SourceCaptureOptionInfo';

function SourceCaptureChip() {
    const intl = useIntl();
    const formActive = useFormStateStore_isActive();

    const { updateDraft } = useSourceCapture();

    const [sourceCapture, resetState, deltaUpdates, targetSchema] =
        useSourceCaptureStore((state) => [
            state.sourceCapture,
            state.resetState,
            state.deltaUpdates,
            state.targetSchema,
        ]);

    const [
        sourceCaptureDeltaUpdatesSupported,
        sourceCaptureTargetSchemaSupported,
    ] = useBindingStore((state) => [
        state.sourceCaptureDeltaUpdatesSupported,
        state.sourceCaptureTargetSchemaSupported,
    ]);

    const saving = useSourceCaptureStore((state) => state.saving);

    console.log('sourceCapture', sourceCapture);

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
                    spacing={3}
                    sx={{
                        alignItems: 'center',
                        pr: sourceCapture ? 3 : undefined,
                    }}
                >
                    <Box sx={{ ...truncateTextSx, minWidth: 100 }}>{label}</Box>
                    {(sourceCaptureDeltaUpdatesSupported ||
                        sourceCaptureTargetSchemaSupported) &&
                    sourceCapture ? (
                        <>
                            <SourceCaptureOptionInfo
                                enabled={targetSchema === 'fromSourceName'}
                                messageKey="workflows.sourceCapture.optionalSettings.targetSchema.chip"
                            />

                            <SourceCaptureOptionInfo
                                enabled={Boolean(deltaUpdates)}
                                messageKey="workflows.sourceCapture.optionalSettings.deltaUpdates.chip"
                            />
                        </>
                    ) : null}
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
                'minWidth': sourceCapture ? 375 : undefined,

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
                sourceCapture
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
