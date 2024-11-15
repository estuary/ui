import { Stack, Typography } from '@mui/material';
import DeltaUpdates from 'components/editor/Bindings/DeltaUpdates';
import SchemaMode from 'components/editor/Bindings/SchemaMode';
import { useIntl } from 'react-intl';
import { useBindingStore } from 'stores/Binding/Store';

function OptionalSettings() {
    const intl = useIntl();

    const [
        sourceCaptureDeltaUpdatesSupported,
        sourceCaptureTargetSchemaSupported,
    ] = useBindingStore((state) => [
        state.sourceCaptureDeltaUpdatesSupported,
        state.sourceCaptureTargetSchemaSupported,
    ]);

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
