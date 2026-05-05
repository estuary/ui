import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DeltaUpdatesUpdateWrapper from 'src/components/materialization/source/deltaUpdates/UpdateWrapper';
import FieldsRecommendedUpdateWrapper from 'src/components/materialization/source/fieldsRecommended/UpdateWrapper';
import TargetSchemaUpdateWrapper from 'src/components/materialization/source/targetSchema/UpdateWrapper';
import { useBinding_sourceCaptureFlags } from 'src/stores/Binding/hooks';
import { useTargetNaming_model } from 'src/stores/TargetNaming/hooks';

function SourceConfiguration() {
    const intl = useIntl();

    const {
        sourceCaptureDeltaUpdatesSupported,
        sourceCaptureTargetSchemaSupported,
    } = useBinding_sourceCaptureFlags();

    const targetNamingModel = useTargetNaming_model();

    return (
        <Stack spacing={1} sx={{ pb: 2, maxWidth: '50%' }}>
            <Typography
                variant="formSectionHeader"
                style={{
                    marginBottom:
                        !sourceCaptureDeltaUpdatesSupported &&
                        !sourceCaptureTargetSchemaSupported
                            ? 6
                            : undefined,
                }}
            >
                {intl.formatMessage({
                    id: 'workflows.sourceCapture.optionalSettings.header',
                })}
            </Typography>

            <Stack spacing={3}>
                {sourceCaptureDeltaUpdatesSupported ? (
                    <DeltaUpdatesUpdateWrapper />
                ) : null}

                {/* TODO (target naming:post migration:remove)*/}
                {targetNamingModel === 'sourceTargetNaming' ? (
                    <TargetSchemaUpdateWrapper />
                ) : null}

                <FieldsRecommendedUpdateWrapper />
            </Stack>
        </Stack>
    );
}

export default SourceConfiguration;
