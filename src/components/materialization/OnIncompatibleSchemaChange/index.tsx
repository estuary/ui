import { Box, Stack, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import SpecificationIncompatibleSchemaChangeForm from './Form';

function OnIncompatibleSchemaChange() {
    const intl = useIntl();

    return (
        <Box sx={{ mt: 3, mb: 5 }}>
            <Stack spacing={1} sx={{ mb: 1 }}>
                <Typography variant="formSectionHeader">
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

            <SpecificationIncompatibleSchemaChangeForm />
        </Box>
    );
}

export default OnIncompatibleSchemaChange;
