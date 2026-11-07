import { Stack, Typography } from '@mui/material';

import SelectCapture from 'src/components/materialization/source/Capture/SelectCapture';
import SourceCaptureChip from 'src/components/materialization/source/Capture/SourceCaptureChip';
import SourceConfiguration from 'src/components/materialization/source/SourceConfiguration';

function SourceCapture() {
    return (
        <Stack spacing={1}>
            <SourceConfiguration />

            <Typography variant="formSectionHeader">Link Capture</Typography>

            <Typography>
                Linking a capture to a materialization automatically adds all
                newly discovered collections as bindings to the materialization.
                Unlinking does not remove any existing bindings.
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
