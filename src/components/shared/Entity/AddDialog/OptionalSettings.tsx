import { Stack, Typography } from '@mui/material';
import DeltaUpdates from 'src/components/editor/Bindings/DeltaUpdates';
import SchemaMode from 'src/components/editor/Bindings/SchemaMode';
import { useIntl } from 'react-intl';
import { useBinding_sourceCaptureFlags } from 'src/stores/Binding/hooks';

function OptionalSettings() {
    const intl = useIntl();

    const {
        sourceCaptureDeltaUpdatesSupported,
        sourceCaptureTargetSchemaSupported,
    } = useBinding_sourceCaptureFlags();

    if (
        !sourceCaptureDeltaUpdatesSupported &&
        !sourceCaptureTargetSchemaSupported
    ) {
        return null;
    }

    return (
        <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography variant="formSectionHeader">
                {intl.formatMessage({
                    id: 'workflows.sourceCapture.optionalSettings.header',
                })}
            </Typography>

            <Stack spacing={2} direction="row">
                {sourceCaptureDeltaUpdatesSupported ? <DeltaUpdates /> : null}

                {sourceCaptureTargetSchemaSupported ? <SchemaMode /> : null}
            </Stack>
        </Stack>
    );
}

export default OptionalSettings;
