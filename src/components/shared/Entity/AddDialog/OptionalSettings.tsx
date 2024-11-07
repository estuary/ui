import { Stack, Typography } from '@mui/material';
import DeltaUpdates from 'components/editor/Bindings/DeltaUpdates';
import SchemaMode from 'components/editor/Bindings/SchemaMode';

function OptionalSettings() {
    return (
        <Stack spacing={1} sx={{ mt: 2 }}>
            <Typography variant="formSectionHeader">
                Source Capture Binding Settings
            </Typography>

            <Stack spacing={2} direction="row">
                <DeltaUpdates />
                <SchemaMode />
            </Stack>
        </Stack>
    );
}

export default OptionalSettings;
