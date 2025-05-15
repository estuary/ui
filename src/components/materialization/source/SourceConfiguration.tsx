import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DeltaUpdatesUpdateWrapper from 'src/components/materialization/source/deltaUpdates/UpdateWrapper';
import TargetSchemaUpdateWrapper from 'src/components/materialization/source/targetSchema/UpdateWrapper';
import { useBinding_sourceCaptureFlags } from 'src/stores/Binding/hooks';

function SourceConfiguration() {
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
        <Stack spacing={1} sx={{ pt: 2 }}>
            <Typography variant="formSectionHeader">
                {intl.formatMessage({
                    id: 'workflows.sourceCapture.optionalSettings.header',
                })}
            </Typography>

            <Stack spacing={2}>
                {sourceCaptureDeltaUpdatesSupported ? (
                    <DeltaUpdatesUpdateWrapper />
                ) : null}

                {sourceCaptureTargetSchemaSupported ? (
                    <TargetSchemaUpdateWrapper />
                ) : null}
            </Stack>
        </Stack>
    );
}

export default SourceConfiguration;
