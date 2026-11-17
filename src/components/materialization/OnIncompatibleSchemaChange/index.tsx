import { Box, Stack, Typography } from '@mui/material';

import Form from 'src/components/materialization/OnIncompatibleSchemaChange/Form';

function OnIncompatibleSchemaChange() {
    return (
        <Box>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography variant="formSectionHeader">
                    Incompatible Schema Change
                </Typography>

                <Typography>
                    The action to take when a schema change is rejected due to
                    incompatibility. If blank, all bindings will backfill and be
                    re-materialized.
                </Typography>
            </Stack>

            <Form />
        </Box>
    );
}

export default OnIncompatibleSchemaChange;
