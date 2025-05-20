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
        <Stack spacing={1} sx={{ pt: 2, maxWidth: '50%' }}>
            <Typography variant="formSectionHeader">
                {intl.formatMessage({
                    id: 'workflows.sourceCapture.optionalSettings.header',
                })}
            </Typography>

            <Stack spacing={2}>
                {sourceCaptureDeltaUpdatesSupported ? (
                    <Stack>
                        <Typography style={{ fontWeight: 500 }}>
                            {intl.formatMessage({
                                id: 'deltaUpdates.header',
                            })}
                        </Typography>

                        <Typography>
                            {intl.formatMessage({
                                id: 'deltaUpdates.message',
                            })}
                        </Typography>

                        <DeltaUpdatesUpdateWrapper />
                    </Stack>
                ) : null}

                {sourceCaptureTargetSchemaSupported ? (
                    <Stack>
                        <Typography style={{ fontWeight: 500 }}>
                            {intl.formatMessage({
                                id: 'schemaMode.header',
                            })}
                        </Typography>

                        <Typography>
                            {intl.formatMessage({
                                id: 'schemaMode.message',
                            })}
                        </Typography>

                        <TargetSchemaUpdateWrapper />
                    </Stack>
                ) : null}
            </Stack>
        </Stack>
    );
}

export default SourceConfiguration;
