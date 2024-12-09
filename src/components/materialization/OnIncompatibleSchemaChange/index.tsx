import { Box, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import Form from './Form';

function OnIncompatibleSchemaChange() {
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
                        id: 'incompatibleSchemaChange.message.specificationSetting',
                    })}
                </Typography>
            </Stack>

            <Form />
        </Box>
    );
}

export default OnIncompatibleSchemaChange;
