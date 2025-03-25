import type { OnIncompatibleSchemaChangeProps } from 'components/incompatibleSchemaChange/types';
import { Box, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import Form from './Form';

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
