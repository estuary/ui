import { Stack, Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SelectCapture from 'src/components/materialization/SourceCapture/SelectCapture';
import SourceCaptureChip from 'src/components/materialization/SourceCapture/SourceCaptureChip';
import SourceCaptureOptions from 'src/components/materialization/SourceCapture/SourceCaptureOptions';

function SourceCapture() {
    const intl = useIntl();
    return (
        <Stack spacing={1}>
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

            <SourceCaptureOptions />
        </Stack>
    );
}

export default SourceCapture;
