import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import DeltaUpdates from 'src/components/editor/Bindings/DeltaUpdates';
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
                {sourceCaptureDeltaUpdatesSupported ? <DeltaUpdates /> : null}

                {sourceCaptureTargetSchemaSupported ? (
                    <TargetSchemaUpdateWrapper />
                ) : // <TargetSchemaForm
                //     currentSetting={targetSchema}
                //     scope="spec"
                //     updateDraftedSetting={() => {
                //         console.log('updatine', { setTargetSchema });
                //     }}
                // />
                null}
            </Stack>
        </Stack>
    );
}

export default SourceConfiguration;
