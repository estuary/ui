import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DeltaUpdatesUpdateWrapper from 'src/components/materialization/source/deltaUpdates/UpdateWrapper';
import FieldsRecommendedUpdateWrapper from 'src/components/materialization/source/fieldsRecommended/UpdateWrapper';
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
        <Stack spacing={1} sx={{ pb: 2, maxWidth: '50%' }}>
            <Typography variant="formSectionHeader">
                {intl.formatMessage({
                    id: 'workflows.sourceCapture.optionalSettings.header',
                })}
            </Typography>

            <Stack spacing={3}>
                {sourceCaptureDeltaUpdatesSupported ? (
                    <DeltaUpdatesUpdateWrapper />
                ) : null}

                {sourceCaptureTargetSchemaSupported ? (
                    <Stack>
                        <Typography sx={{ mb: 2 }}>
                            {intl.formatMessage({
                                id: 'schemaMode.message',
                            })}
                        </Typography>

                        <TargetSchemaUpdateWrapper />
                    </Stack>
                ) : null}

                <FieldsRecommendedUpdateWrapper />
            </Stack>
        </Stack>
    );
}

export default SourceConfiguration;
