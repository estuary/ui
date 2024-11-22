import { Box, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import OnIncompatibleSchemaChangeForm from './Form';

function OnIncompatibleSchemaChange() {
    const intl = useIntl();

    return (
        <Box sx={{ mt: 3, mb: 5 }}>
            <Stack spacing={1} sx={{ mb: 1 }}>
                <Stack direction="row">
                    <Typography variant="formSectionHeader">
                        {intl.formatMessage({
                            id: 'incompatibleSchemaChange.header',
                        })}
                    </Typography>
                </Stack>

                <Typography>
                    {intl.formatMessage({
                        id: 'incompatibleSchemaChange.message.specificationSetting',
                    })}
                </Typography>
            </Stack>

            <OnIncompatibleSchemaChangeForm />
        </Box>
    );
}

export default OnIncompatibleSchemaChange;
