import { Box, Stack, Typography } from '@mui/material';

import Form from './Form';
import { useIntl } from 'react-intl';

import { OnIncompatibleSchemaChangeProps } from 'src/components/incompatibleSchemaChange/types';

function OnIncompatibleSchemaChange({
    bindingIndex = -1,
}: OnIncompatibleSchemaChangeProps) {
    const intl = useIntl();

    return (
        <Box>
            <Stack spacing={1} sx={{ mb: 2 }}>
                <Typography style={{ fontWeight: 500 }}>
                    {intl.formatMessage({
                        id: 'incompatibleSchemaChange.header',
                    })}
                </Typography>

                <Typography>
                    {intl.formatMessage({
                        id: 'incompatibleSchemaChange.message',
                    })}
                </Typography>
            </Stack>

            <Form bindingIndex={bindingIndex} />
        </Box>
    );
}

export default OnIncompatibleSchemaChange;
