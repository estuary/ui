import type { OnIncompatibleSchemaChangeProps } from 'src/components/incompatibleSchemaChange/types';

import { Box, Stack, Typography } from '@mui/material';

import Form from 'src/components/editor/Bindings/OnIncompatibleSchemaChange/Form';

function OnIncompatibleSchemaChange({
    bindingIndex = -1,
}: OnIncompatibleSchemaChangeProps) {
    return (
        <Box>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography style={{ fontWeight: 500 }}>
                    Incompatible Schema Change
                </Typography>

                <Typography>
                    The action to take when a schema change is rejected due to
                    incompatibility. If blank, the binding will backfill and be
                    re-materialized.
                </Typography>
            </Stack>

            <Form bindingIndex={bindingIndex} />
        </Box>
    );
}

export default OnIncompatibleSchemaChange;
