import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SelectCapture from 'src/components/materialization/source/Capture/SelectCapture';
import SourceCaptureChip from 'src/components/materialization/source/Capture/SourceCaptureChip';
import SourceConfiguration from 'src/components/materialization/source/SourceConfiguration';

function SourceCapture() {
    const intl = useIntl();
    return (
        <Stack spacing={1}>
            <SourceConfiguration />

            <Typography variant="formSectionHeader">
                {intl.formatMessage({ id: 'workflows.sourceCapture.header' })}
            </Typography>

            <Typography>
                {intl.formatMessage({
                    id: 'workflows.sourceCapture.optin.message',
                })}
            </Typography>

            <Stack
                direction="row"
                spacing={2}
                sx={{
                    alignItems: 'center',
                }}
            >
                <SourceCaptureChip />
                <SelectCapture />
            </Stack>
        </Stack>
    );
}

export default SourceCapture;
